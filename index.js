const makeMark = type => ({
  symbol: {
    type, name: '__mark__' + Math.random()
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
});

const condMark = makeMark('condition');
const cachedArgTypeList = new WeakMap();

function getArgTypeList(def) {
  let typeList = cachedArgTypeList.get(def);
  if (typeList) return typeList;

  let args = String(def).match(/\((.+)\) (=>|\{)/) || [];
  args = (args[1] || '').split(/, /);

  cachedArgTypeList.set(def, typeList = args.map(arg => {
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
  }));

  return typeList;
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

function makeCond(cond) {
  switch (typeof cond) {
    case 'function': return cond;
    case 'boolean': return () => cond;
    default: return () => false;
  }
}

function when(...guards) {
  return condMark.add((...args) =>
    guards.every(cond => makeCond(cond)(...args)))
}

function match(...defs) {
  let groups = toGroup(defs);
  return (...args) => {
    let argsLength = args.length;
    for (let i = 0; i < groups.length; ++i) {
      let { def, cond } = groups[i];
      if (argsLength != def.length) {
        continue;
      }
      if (cond && !cond(...args)) {
        continue;
      }
      if (matchArgs(args, getArgTypeList(def))) {
        return def(...args);
      }
    }
  }
}

exports.when = when;
exports.match = match;
