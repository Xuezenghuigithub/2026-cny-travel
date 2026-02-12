function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, precision = 1) {
  const base = 10 ** precision;
  return Math.round(value * base) / base;
}

export function createJourneyEngine({ model, store, onEvent }) {
  let rafId = 0;
  let running = false;
  let lastTs = 0;
  let eventCursor = 0;

  const events = [...model.events].sort((a, b) => a.triggerKm - b.triggerKm);

  function syncEventCursor(km) {
    let idx = 0;
    while (idx < events.length && events[idx].triggerKm <= km) {
      idx += 1;
    }
    eventCursor = idx;
  }

  function derive(next) {
    const km = clamp(next.km, 0, model.totalKm);
    const progress = km / model.totalKm;
    const dayIndex = model.getDayIndexByKm(km);
    const segment = model.segments[dayIndex];
    const segmentDistance = Math.max(1, segment.endKm - segment.startKm);
    const segmentProgress = clamp((km - segment.startKm) / segmentDistance, 0, 1);

    return {
      ...next,
      km: round(km, 1),
      progress,
      dayIndex,
      segmentProgress
    };
  }

  function emitEvent(event) {
    if (onEvent) {
      onEvent(event, store.getState());
    }
  }

  function applyTick(dtSec) {
    store.update((prev) => {
      let next = { ...prev };

      if (next.mode === 'driving' && next.auto) {
        const baseKmPerSec = 22 / 60;
        const speed = Math.max(0.5, next.speedMultiplier + next.speedModifier);
        const deltaKm = baseKmPerSec * speed * dtSec;

        next.km += deltaKm;
        next.fuel = clamp(next.fuel - deltaKm * 0.032, 0, 100);
        next.fatigue = clamp(next.fatigue + deltaKm * 0.042, 0, 100);
      }

      if (next.mode === 'driving' && !next.auto) {
        next.fatigue = clamp(next.fatigue - dtSec * 1.2, 0, 100);
      }

      return derive(next);
    });

    const snapshot = store.getState();

    while (eventCursor < events.length && snapshot.km >= events[eventCursor].triggerKm) {
      emitEvent(events[eventCursor]);
      eventCursor += 1;
    }

    if (snapshot.km >= model.totalKm) {
      store.setState(derive({ ...snapshot, mode: 'arrived', auto: false }));
    }
  }

  function frame(ts) {
    if (!running) return;
    const dtMs = lastTs ? ts - lastTs : 16;
    lastTs = ts;
    applyTick(clamp(dtMs, 8, 120) / 1000);
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
    },
    setAuto(auto) {
      store.update((prev) => derive({ ...prev, auto }));
    },
    toggleAuto() {
      const { auto } = store.getState();
      this.setAuto(!auto);
    },
    setSpeedMultiplier(multiplier) {
      store.update((prev) => derive({ ...prev, speedMultiplier: clamp(multiplier, 0.5, 3) }));
    },
    nudgeKm(deltaKm) {
      store.update((prev) => derive({ ...prev, km: prev.km + deltaKm, auto: false }));
      syncEventCursor(store.getState().km);
    },
    seekToKm(km, { auto = false } = {}) {
      store.update((prev) =>
        derive({
          ...prev,
          km,
          mode: 'driving',
          auto
        })
      );
      syncEventCursor(store.getState().km);
    },
    resetToKm(km = 0) {
      const seed = store.getState();
      store.setState(
        derive({
          ...seed,
          km,
          mode: 'driving',
          auto: false,
          fatigue: 10,
          fuel: 100,
          speedModifier: 0
        })
      );
      syncEventCursor(store.getState().km);
    }
  };
}
