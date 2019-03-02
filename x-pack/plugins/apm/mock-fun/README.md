# jest.mock Problems

For some reason, in this repo, `jest.mock()` doesn't work in TS files.

To reproduce:

- Navigate to the x-pack root
- Run `$ node scripts/jest --watch apm/mock-fun`

You'll see that the JS version of the test fails because the mock has taken over and produced "undefined", whereas the TS version of the test passes because the real function is still being called.

```shell
 FAIL  plugins/apm/mock-fun/js/A.testy.test.js
  ● A.js

    expect(received).toEqual(expected)

    Expected: "REAL C"
    Received: undefined

      10 |
      11 | test('A.js', () => {
    > 12 |   expect(a()).toEqual('REAL C');
         |               ^
      13 | });
      14 |

      at Object.toEqual (plugins/apm/mock-fun/js/A.testy.test.js:12:15)

 PASS  plugins/apm/mock-fun/ts/A.testy.test.ts

Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        2.35s
Ran all test suites matching /mock-fun/i.
```
