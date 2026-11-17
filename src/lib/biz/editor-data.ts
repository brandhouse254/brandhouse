import { listClients, listProjects } from "./data";
import { billToFromClient } from "./sheet";

/** Pickers for the quote / invoice / receipt editor. */
export async function editorOptions() {
  const [clients, projects] = await Promise.all([listClients(), listProjects()]);
  return {
    clients: clients.map((c) => ({ id: c.id, label: c.company ? `${c.company} (${c.name})` : c.name, billTo: billToFromClient(c) })),
    projects: projects.map((p) => ({ id: p.id, label: p.name, clientId: p.clientId })),
  };
}
