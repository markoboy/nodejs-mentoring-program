import { Environment } from './environment';
import { IEnvironment } from './environment.interface';

describe('Environment class', () => {
    it('should have "load" static method', () => {
        expect(Environment).toHaveProperty('load', expect.any(Function));
    });

    describe('given "load" method is called', () => {
        beforeEach(() => {
            Environment.load();
        });

        describe('when "get" is called without an argument', () => {
            let actual: IEnvironment;

            beforeEach(() => {
                actual = Environment.get();
            });

            it('then it should contain all env configs', () => {
                expect(actual).toMatchObject<IEnvironment>({
                    db: expect.objectContaining<IEnvironment['db']>({
                        debug: expect.any(Boolean),
                        pool: expect.any(Object)
                    }),
                    jwt: expect.objectContaining<IEnvironment['jwt']>({
                        expires: expect.any(String),
                        secret: expect.any(String)
                    }),
                    log: expect.objectContaining<IEnvironment['log']>({
                        console: expect.any(Boolean),
                        level: expect.any(String),
                        path: expect.any(String)
                    }),
                    pg: expect.objectContaining<IEnvironment['pg']>({
                        port: expect.any(Number)
                    }),
                    nodeEnv: expect.any(String),
                    port: expect.any(Number)
                });
            });
        });

        describe('when "get" is called with "port"', () => {
            let actual: IEnvironment['port'];

            beforeEach(() => {
                actual = Environment.get('port');
            });

            it('then the application port should be returned', () => {
                expect(actual).toEqual(expect.any(Number));
            });
        });
    });
});
