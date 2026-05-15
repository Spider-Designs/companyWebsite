function initImpactCounters() {
  // Locate the impact section on the homepage.
  var impactSection = document.querySelector('.impact');
  if (!impactSection) {
    return;
  }

  // Grab each value that should animate (e.g. 40+, 96%, 3x).
  var valueNodes = impactSection.querySelectorAll('.impact-card__value');
  if (!valueNodes.length) {
    return;
  }

  // Split a label into prefix, number, and suffix so symbols/text are preserved.
  function parseValue(text) {
    var match = String(text).trim().match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
      return null;
    }

    return {
      prefix: match[1],
      target: Number(match[2]),
      suffix: match[3],
      decimals: (match[2].split('.')[1] || '').length
    };
  }

  // Keep integer values whole while supporting decimal counters when needed.
  function formatValue(value, decimals) {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }

    return String(Math.round(value));
  }

  // Animate one counter from 0 to its target using an ease-out curve.
  function animateCounter(node) {
    var parsed = parseValue(node.textContent);
    if (!parsed || Number.isNaN(parsed.target)) {
      return;
    }

    var duration = 3000;
    var startTime = null;

    // Per-frame update function driven by requestAnimationFrame.
    function tick(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }

      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = parsed.target * eased;

      node.textContent = parsed.prefix + formatValue(current, parsed.decimals) + parsed.suffix;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        node.textContent = parsed.prefix + formatValue(parsed.target, parsed.decimals) + parsed.suffix;
      }
    }

    window.requestAnimationFrame(tick);
  }

  // Start animations for all impact values.
  function runCounters() {
    valueNodes.forEach(function (node) {
      animateCounter(node);
    });
  }

  // Respect accessibility preferences by disabling motion.
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Trigger once when the section becomes visible in the viewport.
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        runCounters();
        observer.disconnect();
      });
    }, {
      threshold: 0.35
    });

    observer.observe(impactSection);
    return;
  }

  // Fallback for browsers without IntersectionObserver support.
  runCounters();
}

// Initialize on script load.
initImpactCounters();
