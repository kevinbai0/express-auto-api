type MainExpressHttpMethods = "get" | "post" | "put" | "delete";
type OtherHttpMethod = "checkout" | "copy" | "head" | "lock" | "merge" | "mkactivity" | "mkcol" | "move" | "m-search" | "notify" | "options" | "patch" | "purge" | "report" | "search" | "subscribe" | "trace" | "unlock" | "subscribe";
type ExpressHttpMethods = MainExpressHttpMethods | OtherHttpMethod;
type IAppConfig = {
    port?: number;
};
