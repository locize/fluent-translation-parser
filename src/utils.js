export function astStats(ast) {
  // console.warn(JSON.stringify(ast, null, 2))
  const stats = {
    references: 0,
    variables: 0,
    selectors: 0,
    tags: 0
  }

  function process(children) {
    if (!children) return;

    children.forEach(child => {
      if (child.type === 'tag') stats.tags++;
      if (child.type === 'variable') stats.variables++;
      if (child.type === 'reference') stats.references++;
      if (child.type === 'selector') stats.selectors++;

      if (child.children) process(child.children);
    });
  }

  process(ast);
  // console.warn(stats);
  return stats;
}
