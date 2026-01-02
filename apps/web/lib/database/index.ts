export class Database {
	private static instance: Database;

	private constructor() {}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}

	async query(sql: string, params: any[] = []) {
		console.log("Database query:", sql, params);
		return { rows: [], rowCount: 0 };
	}

	async connect() {
		console.log("Database connected");
		return this;
	}
}

export const db = Database.getInstance();
