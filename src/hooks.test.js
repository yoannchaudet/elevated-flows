const { OnInit, OnIssue, OnSchedule, HooksCaller } = require('./hooks')

describe('Hooks', () => {
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

  it('matches OnSchedule hook', () => {
    const ctx = {
      github: {
        eventName: 'schedule',
        payload: {
          schedule: '0 0 * * *'
        }
      }
    }
    const hook = new OnSchedule(ctx, '0 0 * * *')
    expect(hook.matches()).toBe(true)
    ctx.github.payload.schedule = '0 0 * * 1'
    expect(hook.matches()).toBe(false)
  })
})

describe('HooksCaller', () => {
  it('adds hook', () => {
    const hooks = new HooksCaller({})
    const hook1 = hooks.onHooks.onInit('main')
    expect(hooks.hooks.length).toBe(1)
    expect(hooks.hooks.includes(hook1)).toBe(true)
    const hook2 = hooks.onHooks.onIssue()
    expect(hooks.hooks.length).toBe(2)
    expect(hooks.hooks.includes(hook2)).toBe(true)
    const hook3 = hooks.onHooks.onSchedule('0 0 * * *')
    expect(hooks.hooks.length).toBe(3)
    expect(hooks.hooks.includes(hook3)).toBe(true)
  })

  it('invokes the right hook', async () => {
    const hooks = new HooksCaller({})
    const hook1 = {
      matches: jest.fn().mockReturnValue(false)
    }
    const hook2 = {
      matches: jest.fn().mockReturnValue(false)
    }
    const hook3 = {
      matches: jest.fn().mockReturnValue(true),
      lambda: jest.fn()
    }
    hooks.hooks = [hook1, hook2, hook3]
    await hooks.do()
    expect(hook1.matches).toBeCalledTimes(1)
    expect(hook2.matches).toBeCalledTimes(1)
    expect(hook3.matches).toBeCalledTimes(1)
    expect(hook3.lambda).toBeCalledTimes(1)
  })
})
