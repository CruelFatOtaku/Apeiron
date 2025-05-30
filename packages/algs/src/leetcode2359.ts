function closestMeetingNode(
  edges: number[],
  node1: number,
  node2: number
): number {
  function getDistances(start: number): number[] {
    const distances = new Array(edges.length).fill(-1);
    let current = start;
    let dist = 0;

    while (current !== -1 && distances[current] === -1) {
      distances[current] = dist;
      current = edges[current] as number;
      dist++;
    }

    return distances;
  }

  const dist1 = getDistances(node1);
  const dist2 = getDistances(node2);

  let closestNode = -1;
  let minMaxDist = Infinity;

  for (let i = 0; i < edges.length; i++) {
    if (dist1[i] !== -1 && dist2[i] !== -1) {
      const maxDist = Math.max(dist1[i] as number, dist2[i] as number);
      if (maxDist < minMaxDist || (maxDist === minMaxDist && i < closestNode)) {
        minMaxDist = maxDist;
        closestNode = i;
      }
    }
  }

  return closestNode;
}

console.log(closestMeetingNode([2, 2, 3, -1], 0, 1)); // Output: 2
console.log(closestMeetingNode([1, 2, -1], 0, 2)); // Output: 2
