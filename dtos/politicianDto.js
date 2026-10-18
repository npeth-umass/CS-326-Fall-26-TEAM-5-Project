export function toPoliticianDto(politician) {
  return {
    name: politician.name,
    party: politician.party,
    state: politician.state,
    ...(politician.district !== undefined ? { district: politician.district } : {}),
    chamber: politician.chamber,
    ...(politician.bioguideId ? { bioguideId: politician.bioguideId } : {}),
    ...(politician.imageUrl ? { imageUrl: politician.imageUrl } : {}),
  };
}
