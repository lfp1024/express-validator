import { CustomValidator, Meta } from '../base';
import { Context } from '../context';
import { ContextItem } from './context-item';

export class CustomValidation implements ContextItem {
  message: any;

  constructor(private readonly validator: CustomValidator, private readonly negated: boolean) {}

  async run(context: Context, value: any, meta: Meta) { // 自定义 custom 执行的地方。value 为参数值。validator 为 options 方法
    try {
      const result = this.validator(value, meta); // 调用自定义的 options 方法。e.g. custom.options
      const actualResult = await result;
      const isPromise = result && result.then;
      const failed = this.negated ? actualResult : !actualResult;

      // A promise that was resolved only adds an error if negated.
      // Otherwise it always suceeds
      if ((!isPromise && failed) || (isPromise && this.negated)) {
        context.addError(this.message, value, meta);
      }
    } catch (err) {
      if (this.negated) {
        return;
      }

      context.addError(this.message || (err instanceof Error ? err.message : err), value, meta);
    }
  }
}
