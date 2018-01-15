const condMark = {
  symbol: {
    type: 'condition',
    name: '__mark__' + Math.random()
  },
  add(fn) {
    let { name, type } = this.symbol;
    let addon = { [name]: type };
    return Object.assign((...args) => fn(...args), addon);
  },
  check(fn) {
    if (!fn) return false;
    let { name, type } = this.symbol;
    return fn[name] === type;
  }
}

function getArgTypes(def) {
  let args = String(def).match(/\((.+)\) (=>|\{)/) || [];
  args = (args[1] || '').split(/, /);
  return args.map(arg => {
    let type = 'normal';
    if (/^\[\s*\]$|^\{\s*\}$/.test(arg)) {
      type = 'empty';
    }
    else if (/^_+$/.test(arg)) {
      type = 'any';
    }
    return {
      name: type, value: arg
    }
  });
}

function toGroup(defs) {
  return defs.reduce((group, def, i) => {
    let next = defs[i + 1];
    condMark.check(def) || group.push({
      def: def,
      cond: condMark.check(next) ? next : null
    });
    return group;
  }, []);
}

function matchArgs(args, typeList) {
  for (let i = 0; i < typeList.length; ++i) {
    let type = typeList[i], arg = args[i];
    if (type.name === 'empty') {
      return (JSON.stringify(arg) === type.value);
    }
    return true;
  }
}

function makeGuard(cond) {
  switch (typeof cond) {
    case 'function': return cond;
    case 'boolean': return () => cond;
    default: return () => false;
  }
}

function when(cond) {
  let guard = makeGuard(cond);
  return condMark.add(guard);
}

function match(...defs) {
  let groups = toGroup(defs);
  let typeList = defs.map(getArgTypes);
  return (...args) => {
    let argsLength = args.length;
    for (let i = 0; i < groups.length; ++i) {
      let { def, cond } = groups[i];
      if (argsLength !== def.length) {
        continue;
      }
      if (cond && !cond(...args)) {
        continue;
      }
      if (matchArgs(args, typeList[i])) {
        return def(...args);
      }
    }
  }
}

exports.when = when;
exports.match = match;
