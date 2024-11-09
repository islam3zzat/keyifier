export const camelToPascalWithSpace = (input: string) => {
  return input
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
};
