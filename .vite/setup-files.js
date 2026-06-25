// Stub the global fetch with a vi.fn() so tests that do not set up their own
// fetch mock cannot make real HTTP calls. Individual tests override this in
// their own beforeEach hooks as needed.
vi.stubGlobal('fetch', vi.fn())
