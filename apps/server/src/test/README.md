# Running User API Tests

These tests require the Firebase emulators to be running.

## Prerequisites

1. Firebase emulators for Auth and Firestore must be running
2. The emulators should be running on these ports:
    - Firebase Auth: localhost:9099
    - Firestore: localhost:8080

## Starting the emulators

To start the Firebase emulators, run the following command from the `apps/mobile/emulators` directory:

```bash
firebase emulators:start
```

This will start both the Auth and Firestore emulators according to the configuration in `firebase.json`.

## Running the tests

Once the emulators are running, you can run the tests using:

```bash
yarn test
```

The test script automatically:

1. Cleans up any existing test users from previous runs
2. Sets up the testing environment with correct Firebase emulator connections
3. Creates test users for running the test cases
4. Runs the test cases against the emulators
5. Cleans up after tests are complete

## Test Structure

The tests cover the following areas:

- User profile management
- Friend invitation system
- Friend list management
- User blocking functionality

## Common issues

If you see connection errors like `ECONNREFUSED ::1:8080`, it means the Firestore emulator is not running or not accessible.

Make sure that:

1. The emulators are running
2. The ports match what's in the test configuration (8080 for Firestore, 9099 for Auth)
3. No firewall is blocking the connections
