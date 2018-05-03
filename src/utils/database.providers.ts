import * as mongoose from 'mongoose';
import {Mockgoose} from 'mockgoose-fix';

export const databaseProviders = [
  {
    provide: 'DbConnection',
    useFactory: async () => {
      (mongoose as any).Promise = global.Promise;

      if (process.env.NODE_ENV === 'test') {
        const mockgoose = new Mockgoose(mongoose);
        mockgoose.helper.setDbVersion('3.4.14');
        await mockgoose.prepareStorage();
        const port = await mockgoose.getOpenPort();
        await mongoose.connect(
          'mongodb://localhost:27017/mactravel',
          {
            useMongoClient: true,
          }
        );
      } else {
        const connectionString =
          process.env.MONGODB_URL || 'mongodb://localhost:27017/mactravel';
        await mongoose.connect(connectionString, {
          useMongoClient: true,
        });
      }
      return mongoose;
    },
  },
];
