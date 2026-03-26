export const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    cookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
      return this;
    },
    set() {
      return this;
    },
  };

  return res;
};

export const createChain = (value) => {
  const chain = {
    select: () => chain,
    sort: () => chain,
    maxTimeMS: () => chain,
    limit: () => chain,
    skip: () => chain,
    populate: () => chain,
    lean: async () => value,
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
    catch: (reject) => Promise.resolve(value).catch(reject),
  };

  return chain;
};
