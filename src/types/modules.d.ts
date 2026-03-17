declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xssClean(): RequestHandler;
  export default xssClean;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  interface Options {
    replaceWith?: string;
    onSanitize?: (data: { req: Express.Request; key: string }) => void;
    dryRun?: boolean;
    allowDots?: boolean;
  }
  function mongoSanitize(options?: Options): RequestHandler;
  export default mongoSanitize;
}

declare module 'hpp' {
  import { RequestHandler } from 'express';
  interface Options {
    whitelist?: string | string[];
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string;
    checkQuery?: boolean;
  }
  function hpp(options?: Options): RequestHandler;
  export default hpp;
}
