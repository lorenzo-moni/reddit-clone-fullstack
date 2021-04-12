import {
  CurrentUserDocument,
  CurrentUserQuery,
  LoginMutation,
  LogoutMutation,
  RegisterMutation
} from "generated/graphql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            // me query will return null
            betterUpdateQuery<LogoutMutation, CurrentUserQuery>(
              cache,
              { query: CurrentUserDocument },
              _result,
              () => ({ me: null })
            );
          },

          login: (_result, args, cache, info) => {
            betterUpdateQuery<LoginMutation, CurrentUserQuery>(
              cache,
              {
                query: CurrentUserDocument
              },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user
                  };
                }
              }
            );
          },
          register: (_result, args, cache, info) => {
            betterUpdateQuery<RegisterMutation, CurrentUserQuery>(
              cache,
              {
                query: CurrentUserDocument
              },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user
                  };
                }
              }
            );
          }
        }
      }
    }),
    ssrExchange,
    fetchExchange
  ]
});
