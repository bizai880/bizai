export default function AboutPage() {
	return (
		<div
			style={{
				padding: "3rem 1rem",
				maxWidth: "1200px",
				margin: "0 auto",
				fontFamily: "system-ui",
			}}
		>
			<div style={{ textAlign: "center", marginBottom: "3rem" }}>
				<h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "#333" }}>
					🎯 About BizAI
				</h1>
				<p
					style={{
						fontSize: "1.2rem",
						color: "#666",
						maxWidth: "800px",
						margin: "0 auto",
					}}
				>
					Building the future of AI-powered business solutions
				</p>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
					gap: "2rem",
					marginTop: "3rem",
				}}
			>
				<div
					style={{
						padding: "2rem",
						background: "white",
						borderRadius: "12px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							fontSize: "1.5rem",
							marginBottom: "1rem",
							color: "#0070f3",
						}}
					>
						💡 Our Mission
					</h3>
					<p>
						To democratize AI technology for businesses of all sizes, making
						advanced AI solutions accessible and affordable.
					</p>
				</div>

				<div
					style={{
						padding: "2rem",
						background: "white",
						borderRadius: "12px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							fontSize: "1.5rem",
							marginBottom: "1rem",
							color: "#7928ca",
						}}
					>
						🚀 Our Vision
					</h3>
					<p>
						To become the leading platform for AI-powered business automation
						and intelligence.
					</p>
				</div>

				<div
					style={{
						padding: "2rem",
						background: "white",
						borderRadius: "12px",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
					}}
				>
					<h3
						style={{
							fontSize: "1.5rem",
							marginBottom: "1rem",
							color: "#f5a623",
						}}
					>
						🌟 Our Values
					</h3>
					<p>
						Innovation, Accessibility, Reliability, and Customer Success drive
						everything we do.
					</p>
				</div>
			</div>

			<div
				style={{
					marginTop: "3rem",
					padding: "2rem",
					background: "#f8f9fa",
					borderRadius: "12px",
				}}
			>
				<h3
					style={{
						fontSize: "1.5rem",
						marginBottom: "1rem",
						textAlign: "center",
					}}
				>
					🛠️ Technology Stack
				</h3>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: "1rem",
						marginTop: "1rem",
					}}
				>
					<div style={{ textAlign: "center", padding: "1rem" }}>
						<div
							style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#000" }}
						>
							Next.js
						</div>
						<div>React Framework</div>
					</div>
					<div style={{ textAlign: "center", padding: "1rem" }}>
						<div
							style={{
								fontSize: "1.5rem",
								fontWeight: "bold",
								color: "#61dbfb",
							}}
						>
							React
						</div>
						<div>UI Library</div>
					</div>
					<div style={{ textAlign: "center", padding: "1rem" }}>
						<div
							style={{
								fontSize: "1.5rem",
								fontWeight: "bold",
								color: "#007acc",
							}}
						>
							TypeScript
						</div>
						<div>Type Safety</div>
					</div>
					<div style={{ textAlign: "center", padding: "1rem" }}>
						<div
							style={{
								fontSize: "1.5rem",
								fontWeight: "bold",
								color: "#3fa950",
							}}
						>
							Node.js
						</div>
						<div>Runtime</div>
					</div>
				</div>
			</div>

			<div
				style={{
					marginTop: "3rem",
					textAlign: "center",
					padding: "2rem",
				}}
			>
				<h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
					🤝 Get in Touch
				</h3>
				<p style={{ marginBottom: "1rem" }}>
					Have questions or want to learn more?
				</p>
				<a
					href="/contact"
					style={{
						display: "inline-block",
						padding: "1rem 2rem",
						background: "#0070f3",
						color: "white",
						borderRadius: "8px",
						textDecoration: "none",
						fontWeight: "bold",
					}}
				>
					Contact Us
				</a>
			</div>
		</div>
	);
}
