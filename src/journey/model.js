function parseDriveKm(text) {
  const match = String(text).match(/(\d+)\s*km/i);
  return match ? Number(match[1]) : 0;
}

function parseDriveMinutes(text) {
  const hourMatch = String(text).match(/(\d+)h/i);
  const minMatch = String(text).match(/(\d+)m/i);
  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const mins = minMatch ? Number(minMatch[1]) : 0;
  return hours * 60 + mins;
}

function parseTimeLabel(item) {
  const match = String(item).match(/\b\d{1,2}:\d{2}\b/);
  return match ? match[0] : '--:--';
}

export function createJourneyModel(tripPlan) {
  let cursorKm = 0;

  const segments = tripPlan.days.map((day, idx) => {
    const distanceKm = parseDriveKm(day.drive);
    const driveMinutes = Math.max(parseDriveMinutes(day.drive), 60);
    const startKm = cursorKm;
    const endKm = cursorKm + distanceKm;
    cursorKm = endKm;

    return {
      id: `day_${day.id}`,
      dayIndex: idx,
      dayId: day.id,
      startKm,
      endKm,
      distanceKm,
      avgSpeed: Math.round((distanceKm / driveMinutes) * 60),
      biome: day.mood,
      title: day.title
    };
  });

  const totalKm = segments[segments.length - 1]?.endKm || tripPlan.totalDistanceKm || 1;

  const events = [];
  for (const segment of segments) {
    const day = tripPlan.days[segment.dayIndex];

    events.push({
      id: `arrival_${day.id}`,
      type: 'arrival',
      triggerKm: segment.endKm,
      payload: {
        title: `到达 ${day.sleep}`,
        subtitle: day.title
      }
    });

    if (day.festival.includes('除夕') || day.festival.includes('初一') || day.festival.includes('迎财神')) {
      events.push({
        id: `festival_${day.id}`,
        type: 'festival_fx',
        triggerKm: segment.startKm + Math.max(12, segment.distanceKm * 0.52),
        payload: {
          title: `${day.festival} 氛围触发`,
          subtitle: day.element
        }
      });
    }
  }

  events.sort((a, b) => a.triggerKm - b.triggerKm);

  return {
    tripPlan,
    segments,
    events,
    totalKm,
    getDayIndexByKm(km) {
      const safeKm = Math.max(0, Math.min(totalKm, km));
      const idx = segments.findIndex((segment) => safeKm <= segment.endKm);
      return idx === -1 ? segments.length - 1 : idx;
    },
    getSegmentByKm(km) {
      const dayIndex = this.getDayIndexByKm(km);
      return segments[dayIndex];
    },
    getTimeline(dayIndex, segmentProgress) {
      const day = tripPlan.days[dayIndex];
      if (!day) return [];
      const count = day.schedule.length || 1;
      const active = Math.min(count - 1, Math.floor(segmentProgress * count));

      return day.schedule.map((item, idx) => ({
        label: item,
        time: parseTimeLabel(item),
        status: idx < active ? 'done' : idx === active ? 'active' : 'todo'
      }));
    }
  };
}
