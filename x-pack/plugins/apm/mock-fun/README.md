# jest.mock Problems

For some reason, in this repo, `jest.mock()` doesn't work in TS files.

To reproduce:

- Navigate to the x-pack root
- Run `$ node scripts/jest --watch apm/mock-fun`

There are two directories, `./ts` and `./js`. The ts folder has 3 .ts files and 2 test files, while the the .js folder has 3 .js files and 2 test files. In both folders, there is a .ts test file and a .js test file.

The test files mock out the 'C' file and then expect that the function will return undefined since the mock is not returning anything. If the `a()` function instead returns the real value from `C`, then the test fails.

- The `.js` test files both pass, whether they import .js files or .ts files.
- The `.ts` test files both fail, whether they import .js files or .ts files.

```shell
 PASS  plugins/apm/mock-fun/js/A.testy.test.js
 PASS  plugins/apm/mock-fun/ts/A.testy.test.js
 FAIL  plugins/apm/mock-fun/ts/A.testy.test.ts
  ● A.ts

    expect(received).toBeUndefined()

    Received: "REAL C"

      10 |
      11 | test('A.ts', () => {
    > 12 |   expect(a()).toBeUndefined();
         |               ^
      13 | });
      14 |

      at Object.<anonymous>.test (plugins/apm/mock-fun/ts/A.testy.test.ts:12:15)

 FAIL  plugins/apm/mock-fun/js/A.testy.test.ts
  ● TS test file -> importing JS files

    expect(received).toBeUndefined()

    Received: "REAL C"

      11 |
      12 | test('TS test file -> importing JS files', () => {
    > 13 |   expect(a()).toBeUndefined();
         |               ^
      14 | });
      15 |

      at Object.<anonymous>.test (plugins/apm/mock-fun/js/A.testy.test.ts:13:15)

Test Suites: 2 failed, 2 passed, 4 total
Tests:       2 failed, 2 passed, 4 total
Snapshots:   0 total
Time:        3.051s
Ran all test suites matching /mock-fun/i.
```
