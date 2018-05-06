import * as mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose-fix';
import { environments } from '../utils';
export let mockgoose: Mockgoose;
if (process.env.NODE_ENV === 'test') {
  // Bugs: mongod shutdown when run parallel tests
  // This is a shallow fix. However, act knowledge to abelaska
  // ref: https://github.com/Mockgoose/Mockgoose/issues/22
  // fix parallel tests
  Mockgoose.prototype.prepareStorage = function() {
    const _this = this;
    return new Promise(function(resolve, reject) {
      Promise.all([_this.getTempDBPath(), _this.getOpenPort()]).then(promiseValues => {
        const dbPath = promiseValues[0];
        const openPort = promiseValues[1].toString();
        const storageEngine = _this.getMemoryStorageName();
        const mongodArgs = ['--port', openPort, '--storageEngine', storageEngine, '--dbpath', dbPath];
        _this.mongodHelper.mongoBin.commandArguments = mongodArgs;
        const mockConnection = () => {
          _this.mockConnectCalls(_this.getMockConnectionString(openPort));
          resolve();
        };
        _this.mongodHelper
          .run()
          .then(mockConnection)
          .catch(mockConnection);
      });
    });
  };

  mockgoose = new Mockgoose(mongoose);
}

export const databaseProvider = {
  provide: 'DbConnection',
  useFactory: async () => {
    (mongoose as any).Promise = global.Promise;

    if (process.env.NODE_ENV === 'test') {
      mockgoose.helper.setDbVersion('3.4.14'); // mlab mongodb version
      await mockgoose.prepareStorage();
      return await mongoose.connect('mongodb://localhost:27017/mactravel');
    } else {
      return await mongoose.connect(environments.mongoUrl);
    }
  },
};
