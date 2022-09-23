const { Hooks, OnInit, OnIssue } = require('./hooks')

require('./hooks')

describe('hooks', () => {
  it('matches OnInit hook', () => {
    const ctx = {
      github: {
        eventName: 'push'
      }
    }
    const hook = new OnInit(ctx)
    expect(hook.matches()).toBe(true)
    ctx.github.eventName = 'issues'
    expect(hook.matches()).toBe(false)
  })

  it('matches OnIssue hook (no filter)', () => {
    const ctx = {
      github: {
        eventName: 'issues'
      }
    }
    const hook = new OnIssue(ctx)
    expect(hook.matches()).toBe(true)
  })

  it('matches OnIssue hook (event filter)', () => {
    const ctx = {
      github: {
        eventName: 'issues'
      }
    }
    let hook = new OnIssue(ctx).withEvent('opened')
    expect(hook.matches()).toBe(false)
    ctx.github.payload = {
      action: 'opened'
    }
    expect(hook.matches()).toBe(true)
    hook = new OnIssue(ctx).withEvent('opened').withEvent('closed')
    ctx.github.payload = {
      action: 'locked'
    }
    expect(hook.matches()).toBe(false)
    ctx.github.payload = {
      action: 'closed'
    }
    expect(hook.matches()).toBe(true)
  })

  it('matches OnIssue hook (label filter - generic event)', () => {
    const ctx = {
      github: {
        eventName: 'issues'
      }
    }
    let hook = new OnIssue(ctx).withLabel('a')
    expect(hook.matches()).toBe(false)
    ctx.github.payload = {
      labels: [
        {
          name: 'a'
        }
      ]
    }
    expect(hook.matches()).toBe(true)
    hook = new OnIssue(ctx).withLabel('a').withLabel('b')
    expect(hook.matches()).toBe(false)
    ctx.github.payload.labels.push({
      name: 'b'
    })
    expect(hook.matches()).toBe(true)
  })

  it('matches OnIssue hook (label filter - labeled/unlabeled)', () => {
    const ctx = {
      github: {
        eventName: 'issues',
        payload: {
          action: 'labeled'
        }
      }
    }
    let hook = new OnIssue(ctx).withLabel('a')
    expect(hook.matches()).toBe(false)
    ctx.github.payload.label = {
      name: 'a'
    }
    expect(hook.matches()).toBe(true)
    ctx.github.payload.action = 'unlabeled'
    expect(hook.matches()).toBe(true)
    ctx.github.payload.action = 'deleted'
    expect(hook.matches()).toBe(false)
  })

  // WIP

  it('detects onInit()', () => {
    const ctx = {
      github: {
        eventName: 'push'
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
        eventName: 'issues'
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
