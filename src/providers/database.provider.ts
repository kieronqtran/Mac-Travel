import * as mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose-fix';
import { environments } from '../utils';
export let mockgoose: Mockgoose;
if (process.env.NODE_ENV === 'test') {
  mockgoose = new Mockgoose(mongoose);
}

export const databaseProvider = {
  provide: 'DbConnection',
  useFactory: async () => {
    (mongoose as any).Promise = global.Promise;

    if (process.env.NODE_ENV === 'test') {
      mockgoose.helper.setDbVersion('3.4.14');
      await mockgoose.prepareStorage();
      return await mongoose.connect('mongodb://localhost:27017/mactravel');
    } else {
      return await mongoose.connect(environments.mongoUrl);
    }
  },
};
