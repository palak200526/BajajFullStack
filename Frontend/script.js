const analyzeBtn = document.getElementById("analyzeBtn");
const nodeInput = document.getElementById("nodeInput");
const errorMessage = document.getElementById("errorMessage");
const result = document.getElementById("result");

analyzeBtn.addEventListener("click", async () => {

    errorMessage.innerHTML = "";
    result.innerHTML = "";

    const input = nodeInput.value.trim();

    if (input === "") {
        errorMessage.innerHTML = "Please enter some nodes.";
        return;
    }

    const data = input
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");

    try {

        analyzeBtn.disabled = true;
analyzeBtn.innerText = "Analyzing...";

        const response = await fetch("http://localhost:3000/bfhl", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data })
        });

        const resultData = await response.json();

        displayResult(resultData);
        analyzeBtn.disabled = false;
analyzeBtn.innerText = "Analyze";

errorMessage.style.color = "green";
errorMessage.innerHTML = "Analysis completed successfully.";

    } catch (err) {

        errorMessage.innerHTML = "Unable to connect to backend.";

        console.log(err);
        analyzeBtn.disabled = false;
analyzeBtn.innerText = "Analyze";
        errorMessage.style.color = "red";
errorMessage.innerHTML = "Unable to connect to backend.";
    }

});

function displayResult(data) {

    let html = "";

    html += `
        <div class="card">
            <h2>User Details</h2>
            <p><strong>User ID:</strong> ${data.user_id}</p>
            <p><strong>Email:</strong> ${data.email_id}</p>
            <p><strong>Roll Number:</strong> ${data.college_roll_number}</p>
        </div>
    `;

    html += `
        <div class="card">
            <h2>Summary</h2>
            <p>Total Trees : ${data.summary.total_trees}</p>
            <p>Total Cycles : ${data.summary.total_cycles}</p>
            <p>Largest Tree Root : ${data.summary.largest_tree_root}</p>
        </div>
    `;

    html += `<div class="card"><h2>Hierarchies</h2>`;

    data.hierarchies.forEach(item => {

        html += `<hr>`;

        html += `<p><strong>Root:</strong> ${item.root}</p>`;

        if(item.has_cycle){

            html += `<p style="color:red;">Cycle Detected</p>`;

        }else{

            html += `<p><strong>Depth:</strong> ${item.depth}</p>`;

            html += createTree(item.tree);

        }

    });

    html += `</div>`;

    html += `
        <div class="card">
            <h2>Invalid Entries</h2>
            <pre>${JSON.stringify(data.invalid_entries,null,4)}</pre>
        </div>
    `;

    html += `
        <div class="card">
            <h2>Duplicate Edges</h2>
            <pre>${JSON.stringify(data.duplicate_edges,null,4)}</pre>
        </div>
    `;

    result.innerHTML = html;

}

function createTree(tree) {

    let html = "<ul>";

    for (let key in tree) {

        html += `<li><strong>${key}</strong>`;

        if (Object.keys(tree[key]).length > 0) {
            html += createTree(tree[key]);
        }

        html += "</li>";
    }

    html += "</ul>";

    return html;
}