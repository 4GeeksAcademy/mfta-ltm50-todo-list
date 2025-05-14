import React, { useEffect, useState } from "react";

const urlBase = "https://playground.4geeks.com/todo";
const user = "tester25";

const Home = () => {
	const [todos, setTodos] = useState([]);
	const [newTodo, setNewTodo] = useState("");
	const [isLoading, setIsloading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		const fetchTodos = async () => {
			setIsloading(true);
			setErrorMsg("");
			try {
				const response = await fetch(`${urlBase}/users/${user}`);
				if (!response.ok) throw new Error("Error fetching todos");
				const data = await response.json();
				setTodos(data.todos);
			} catch (error) {
				console.error(error);
				setErrorMsg(error.message);
			} finally {
				setIsloading(false);
			}
		};

		fetchTodos();
	}, []);

	const handleInputChange = (e) => {
		setNewTodo(e.target.value);
	};

	const handleAddTodo = async (e) => {
		if (e.key !== "Enter" || newTodo.trim() === "") return;

		const newTodoItem = {
			label: newTodo,
			is_done: false,
		};

		setIsloading(true);
		setErrorMsg("");
		try {
			const response = await fetch(`${urlBase}/todos/${user}`, {
				method: "POST",
				body: JSON.stringify(newTodoItem),
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) throw new Error("Error adding todo");
			const data = await response.json();
			setTodos([...todos, data]);
			setNewTodo("");
		} catch (error) {
			console.error(error);
			setErrorMsg(error.message);
		} finally {
			setIsloading(false);
		}
	};

	const deleteTodoFromAPI = async (id) => {
		try {
			const response = await fetch(`${urlBase}/todos/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Error deleting todo");
			return response;
		} catch (error) {
			console.error("error en deleteTodoFromApí: ", error);
			throw new Error("Error deleting todo");
		}
	};

	const deleteSingleTodo = async (id) => {
		setIsloading(true);
		setErrorMsg("");
		try {
			await deleteTodoFromAPI(id);
			const updatedTodos = todos.filter((todo) => todo.id !== id);
			setTodos(updatedTodos);
		} catch (error) {
			console.error("error en deleteSingleTodo: ", error);
			setErrorMsg(error.message);
		} finally {
			setIsloading(false);
		}
	};

	const deleteAllTodos = async () => {
		setIsloading(true);
		setErrorMsg("");
		try {
			for (const todo of todos) {
				await deleteTodoFromAPI(todo.id);
			}
			setTodos([]);
		} catch (error) {
			console.error("error en deleteAllTodos: ", error);
			setErrorMsg(error.message);
		} finally {
			setIsloading(false);
		}
	};

	return (
		<div className="d-flex flex-column align-items-center justify-content-start min-vh-100 bg-purple-100">
			<h1 className="mt-5 mb-5 text-purple-900 display-1">TODOS</h1>
			<div
				className="d-flex flex-column align-items-center"
				style={{ width: "min(500px, 90vw)" }}
			>
				{
					errorMsg && (
						<div className="alert alert-danger w-100" role="alert">
							{errorMsg}
						</div>
					)
				}
				<input
					type="text"
					className="form-control mb-2"
					placeholder="Add a new task..."
					value={newTodo}
					onChange={handleInputChange}
					onKeyDown={handleAddTodo}
				/>

				{todos.map((todo) => (
					<div
						key={todo.id}
						className="d-flex align-items-center justify-content-between w-100 mb-1 border rounded py-2 px-3 bg-purple-50"
					>
						<p className="p-0 m-0">{todo.label}</p>
						<button
							className="btn btn-sm text-danger p-0"
							disabled={isLoading}
							onClick={() => deleteSingleTodo(todo.id)}
						>
							<i className="fa-solid fa-trash-can"></i>
						</button>
					</div>
				))}

				<div className="d-flex justify-content-between align-items-center w-100">
					<p className="text-start form-text my-2">{todos.length} tareas</p>
					<button
						className={`btn btn-sm btn-outline-danger ${todos.length === 0 ? "invisible" : ""}`}
						disabled={isLoading || todos.length === 0}
						data-bs-toggle="modal"
						data-bs-target="#confirmModal"
					>
						{isLoading ? "Loading..." : "Delete All"}
					</button>
				</div>
			</div>

			{/* Modal */}
			<div
				className="modal fade"
				id="confirmModal"
				tabIndex={-1}
				aria-labelledby="confirmModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="confirmModalLabel">
								Atention
							</h1>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<p>
								Are you sure you want to delete all tasks? This action cannot
								be undone.
							</p>
							{errorMsg && <p className="text-danger">{errorMsg}</p>}
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								data-bs-dismiss="modal"
							>
								Close
							</button>
							<button type="button" className="btn btn-danger" onClick={deleteAllTodos} data-bs-dismiss="modal">
								Delete All
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
