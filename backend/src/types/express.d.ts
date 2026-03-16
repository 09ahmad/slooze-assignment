import type { User, Country } from "../../db/generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: User;
      /**
       * Set by scopeToCountry middleware:
       * - undefined => no filtering (ADMIN)
       * - Country => filter to that country
       */
      countryFilter?: Country;
    }
  }
}

export {};

