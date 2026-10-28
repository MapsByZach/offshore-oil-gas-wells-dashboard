export default async function install(app) {
  const mount = app.getMount("well-details");
  const renderIdle = () => {
    const message = document.createElement("p");
    message.textContent = "Select a well on the map to view its details.";
    mount.replaceChildren(message);
  };
  const renderDetails = (attributes) => {
    const container = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = String(attributes.apinumber || attributes.sourcerecord || "Well record");
    container.appendChild(title);
    const rows = [
      ["Status", attributes.wellstatusdescription || attributes.wellstatus],
      ["Well type", attributes.welltypedescription || attributes.welltype],
      ["Operator", attributes.operator],
      ["Jurisdiction", attributes.jurisdiction],
      ["Source record", attributes.sourcerecord]
    ];
    for (const [label, value] of rows) {
      if (value == null || value === "") continue;
      const row = document.createElement("p");
      const labelNode = document.createElement("strong");
      labelNode.textContent = `${label}: `;
      row.append(labelNode, document.createTextNode(String(value)));
      container.appendChild(row);
    }
    mount.replaceChildren(container);
  };
  renderIdle();
  let request = 0;
  app.actions.register("show-well-details", async ({ graphic }) => {
    const current = ++request;
    const loading = document.createElement("p");
    loading.textContent = "Loading well details…";
    mount.replaceChildren(loading);
    try {
      const layer = app.layers[app.config.layerId];
      const objectId = graphic.getObjectId();
      const result = await layer.queryFeatures({ objectIds: [objectId], outFields: ["*"], returnGeometry: false });
      if (current !== request) return;
      const feature = result.features[0];
      if (!feature) {
        renderIdle();
        return;
      }
      renderDetails(feature.attributes);
    } catch (error) {
      if (current !== request) return;
      const message = document.createElement("p");
      message.textContent = "Unable to load well details.";
      mount.replaceChildren(message);
    }
  });
  app.onCleanup(() => mount.replaceChildren());
}