import {
  ContextHandlerImpl,
  ContextRunnerImpl,
  SanitizersImpl,
  ValidationChain,
  ValidatorsImpl,
} from '../chain';
import { InternalRequest, Location } from '../base';
import { bindAll } from '../utils';
import { ContextBuilder } from '../context-builder';

export function check(
  fields: string | string[] = '',
  locations: Location[] = [],
  message?: any,
): ValidationChain {
  const builder = new ContextBuilder()
    .setFields(Array.isArray(fields) ? fields : [fields])
    .setLocations(locations)
    .setMessage(message);
  const runner = new ContextRunnerImpl(builder);

  const middleware = async (req: InternalRequest, _res: any, next: (err?: any) => void) => {
    try {
      await runner.run(req); // 中间件入口
      next();
    } catch (e) {
      next(e);
    }
  };

  return Object.assign(
    middleware,
    bindAll(runner),
    bindAll(new SanitizersImpl(builder, middleware as any)), // 绑定所有支持及自定义的 sanitizer
    bindAll(new ValidatorsImpl(builder, middleware as any)), // 绑定所有支持的 validator
    bindAll(new ContextHandlerImpl(builder, middleware as any)),
    { builder },
  );
}
