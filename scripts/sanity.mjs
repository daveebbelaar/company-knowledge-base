import {
  sanityClient,
  embeddingsProjection,
  publishedPages,
  publishedEmployees,
} from "../lib/sanity.mjs";
import { readLocalEmployees } from "../lib/employees.mjs";
import { readLocalPages } from "../lib/local-content.mjs";

const client = sanityClient();
const dataset = process.env.SANITY_STUDIO_DATASET;
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const command = process.argv[2];
const projection = embeddingsProjection;
const settings = `/projects/${projectId}/datasets/${dataset}/settings/embeddings`;

try {
  if (command === "setup") {
    const datasets = await client.datasets.list();
    const existing = datasets.find((d) => d.name === dataset);
    if (existing && existing.aclMode !== "private")
      throw new Error(
        `Dataset ${dataset} is public. Choose a new dataset name; setup will not change an existing dataset's access.`,
      );
    if (!existing)
      await client.datasets.create(dataset, { aclMode: "private" });
    await client.request({
      url: settings,
      method: "PUT",
      body: { enabled: true, projection },
    });
    console.log(
      `Private dataset ${dataset} configured. Embeddings enabled. Next: npm run sanity:import`,
    );
  } else if (command === "import") {
    const pages = await readLocalPages();
    const employees = await readLocalEmployees();
    let transaction = client.transaction();
    // Repeatable without overwriting edits made later in Studio.
    for (const person of employees)
      transaction = transaction.createIfNotExists(person);
    for (const page of pages) transaction = transaction.createIfNotExists(page);
    await transaction.commit();
    // Add only missing owner references; preserve all existing Studio content.
    const published = await client.fetch(
      `*[${publishedPages} && !defined(ownerProfile)]{_id, owner}`,
    );
    const people = await client.fetch(`*[${publishedEmployees}]{_id, name}`);
    let links = client.transaction();
    let linked = 0;
    for (const page of published) {
      const person = people.find((p) => p.name === page.owner);
      if (person) {
        links = links.patch(page._id, (p) =>
          p.setIfMissing({
            ownerProfile: { _type: "reference", _ref: person._id },
          }),
        );
        linked++;
      }
    }
    if (linked) await links.commit();
    console.log(
      `Imported ${employees.length} employees; linked ${linked} missing owners. Imported ${pages.length} starter pages (existing IDs left unchanged). Edit in Studio from now on.`,
    );
  } else if (command === "status") {
    const status = await client.request({ url: settings });
    const count = await client.fetch(
      'count(*[_type == "knowledgePage" && !(_id in path("drafts.**"))])',
    );
    console.log(
      JSON.stringify(
        {
          projectId,
          dataset,
          pages: count,
          employees: await client.fetch(`count(*[${publishedEmployees}])`),
          embeddings: status,
        },
        null,
        2,
      ),
    );
  } else throw new Error("Use setup, import, or status.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
