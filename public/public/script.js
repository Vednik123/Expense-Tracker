document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/dashboard");
    const data = await response.json();
    document.getElementById("username").textContent = data.username;

    const transactionsList = document.getElementById("transactions");
    data.transactions.forEach(tx => {
        const li = document.createElement("li");
        li.textContent = `${tx.name} - ₹${tx.amount}`;
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = async () => {
            await fetch("/delete-transaction", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${tx._id}`
            });
            location.reload();
        };
        li.appendChild(delBtn);
        transactionsList.appendChild(li);
    });

    document.getElementById("transaction-form").onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const amount = document.getElementById("amount").value;
        await fetch("/add-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `name=${name}&amount=${amount}`
        });
        location.reload();
    };
});

function logout() {
    fetch("/logout").then(() => location.href = "/");
}
