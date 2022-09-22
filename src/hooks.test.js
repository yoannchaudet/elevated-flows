const { Hooks } = require('./hooks')

require('./hooks')

describe('hooks', () => {
  it('detects onInit()', () => {
    const ctx = {
      github: {
        eventName: 'push',
      }
    }
    const hooks = new Hooks(ctx)
    const lambda = jest.fn(() => {})
    hooks.hookContext.onInit('main').do(lambda)
    expect(lambda).toHaveBeenCalledTimes(0)
    hooks.do()
    expect(lambda).toHaveBeenCalledTimes(1)
  })

  it('detects onIssue()', () => {
    const ctx = {
      github: {
        eventName: 'issues',
      }
    }
    const hooks = new Hooks(ctx)
    const lambda = jest.fn(() => {})
    hooks.hookContext.onIssue().do(lambda)
    expect(lambda).toHaveBeenCalledTimes(0)
    hooks.do()
    expect(lambda).toHaveBeenCalledTimes(1)
  })


})
