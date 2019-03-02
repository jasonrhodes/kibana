# jest.mock Problems

For some reason, in this repo, `jest.mock()` doesn't work in TS files.

If you navigate to the x-pack root and run `$ node scripts/jest --watch apm/mock-fun`, you'll see that the JS version of the test fails because the mock has taken over and produced "undefined", whereas the TS version of the test passes because the real function is still being called.
