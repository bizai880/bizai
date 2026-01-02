import { useEffect, useState } from "react";
import { Badge, Button, Card, Table } from "@/components/ui";

export default function AutomationsDashboard() {
	const [automations, setAutomations] = useState([]);
	const [stats, setStats] = useState({});

	useEffect(() => {
		fetchAutomations();
	}, []);

	const fetchAutomations = async () => {
		const res = await fetch("/api/automations/status");
		const data = await res.json();
		setAutomations(data.automations);
		setStats(data.stats);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">Cloudinary Automations</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<h3 className="font-semibold">Images Processed</h3>
					<p className="text-3xl">{stats.imagesProcessed || 0}</p>
				</Card>
				<Card>
					<h3 className="font-semibold">AI Descriptions</h3>
					<p className="text-3xl">{stats.aiDescriptions || 0}</p>
				</Card>
				<Card>
					<h3 className="font-semibold">Active Automations</h3>
					<p className="text-3xl">{stats.activeAutomations || 0}</p>
				</Card>
			</div>

			<Table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Status</th>
						<th>Last Trigger</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{automations.map((auto: any) => (
						<tr key={auto.id}>
							<td>{auto.type}</td>
							<td>
								<Badge
									variant={auto.status === "active" ? "success" : "warning"}
								>
									{auto.status}
								</Badge>
							</td>
							<td>{new Date(auto.lastTriggered).toLocaleString()}</td>
							<td>
								<Button size="sm" onClick={() => testAutomation(auto.id)}>
									Test
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
