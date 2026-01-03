// Database schema for @bizai/database

export interface DatabaseConfig {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

export interface QueryResult {
	rows: unknown[];
	rowCount: number;
	command: string;
}

export interface Migration {
	id: string;
	name: string;
	appliedAt: Date;
}
