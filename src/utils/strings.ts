const hasTrailingSlash = (name: string) => name[name.length - 1] === '/';

const removeTrailingSlash = (name: string) =>
  hasTrailingSlash(name) ? name.substring(0, name.length - 1) : name;

/** Remove trailing slashes from services names */
export const cleanNames = (serviceNames: string[]) =>
  serviceNames.map((name) => {
    while (hasTrailingSlash(name)) name = removeTrailingSlash(name);
    return name;
  });
