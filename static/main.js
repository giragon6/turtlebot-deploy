document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictForm');

  function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  const randomizeBtn = document.getElementById('randomizeFeaturesBtn');
  if (randomizeBtn && window.featureStats) {
    randomizeBtn.addEventListener('click', () => {
      const { means, stdevs } = window.featureStats;
      Object.keys(means).forEach((feature) => {
        const input = form.querySelector(`input[name="${feature}"]`);
        if (!input) return;

        const mean = Number(means[feature]);
        const std = Number(stdevs[feature] || 0);
        const value = mean + std * randn();

        // Keep display clean while preserving decimals
        input.value = Number.isFinite(value) ? value.toFixed(3) : mean.toFixed(3);
      });
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {};
    for (const [k, v] of formData.entries()) {
      if (k === 'latitude' || k === 'longitude') continue;
      payload[k] = parseFloat(v);
    }

    const lat = parseFloat(formData.get('latitude'));
    const lng = parseFloat(formData.get('longitude'));

    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'success') {
        const predVal = data.prediction;
        const pred = predVal > 0.5;
        const predConf = pred ? predVal : 1 - predVal;
        document.getElementById('predictionOutput').textContent = `${pred ? "Nest present" : "Nest absent"} (Confidence: ${(predConf*100).toFixed(2)}%)`;
      } else if (data.error) {
        document.getElementById('predictionOutput').textContent = 'Error: ' + data.error;
      }

      document.getElementById('featuresOutput').textContent = JSON.stringify(payload, null, 2);

      const iframe = document.getElementById('mapframe');
      const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
      iframe.src = embedUrl;

      const link = document.getElementById('mapLink');
      link.innerHTML = `<a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}">Open location in Google Maps</a>`;

    } catch (err) {
      document.getElementById('predictionOutput').textContent = 'Request failed: ' + err;
    }
  });
});
