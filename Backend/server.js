const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is Running...");
});

function buildTree(node, graph) {

    const children = graph.get(node) || [];

    const tree = {};

    for (let child of children) {
        tree[child] = buildTree(child, graph);
    }

    return tree;
}

function hasCycle(node, graph, visited, recursionStack) {

    visited.add(node);
    recursionStack.add(node);

    const children = graph.get(node) || [];

    for (let child of children) {

        if (!visited.has(child)) {

            if (hasCycle(child, graph, visited, recursionStack)) {
                return true;
            }

        } else if (recursionStack.has(child)) {
            return true;
        }

    }

    recursionStack.delete(node);

    return false;
}


function calculateDepth(node, graph) {

    const children = graph.get(node) || [];

    // Leaf node
    if (children.length === 0) {
        return 1;
    }

    let maxDepth = 0;

    for (let child of children) {
        maxDepth = Math.max(maxDepth, calculateDepth(child, graph));
    }

    return maxDepth + 1;
}

app.post("/bfhl", (req, res) => {

    const input = req.body.data;

    if (!Array.isArray(input)) {
        return res.status(400).json({
            message: "data must be an array"
        });
    }

    const validEdges = [];
    const invalidEntries = [];
    const duplicateEdges = [];

    const pattern = /^[A-Z]->[A-Z]$/;

    // To keep track of seen edges
    const edgeSet = new Set();

    // To ensure duplicates are added only once
    const duplicateSet = new Set();
    const childParentMap = new Map();

    for (let edge of input) {

        edge = edge.trim();

        // Validate format
        if (!pattern.test(edge)) {
            invalidEntries.push(edge);
            continue;
        }

        const [parent, child] = edge.split("->");

        // Self-loop is invalid
        if (parent === child) {
            invalidEntries.push(edge);
            continue;
        }

        // Check duplicate
        if (edgeSet.has(edge)) {

            if (!duplicateSet.has(edge)) {
                duplicateEdges.push(edge);
                duplicateSet.add(edge);
            }

            continue;
        }

        // Check if child already has a parent
        if (childParentMap.has(child)) {
            continue;
        }

        // First parent wins
        childParentMap.set(child, parent);

        edgeSet.add(edge);
        validEdges.push(edge);
    }

    // Build Graph
    const graph = new Map();

    for (let edge of validEdges) {

        const [parent, child] = edge.split("->");

        if (!graph.has(parent)) {
            graph.set(parent, []);
        }

        graph.get(parent).push(child);

        // Ensure child also exists in graph
        if (!graph.has(child)) {
            graph.set(child, []);
        }
    }

    const allNodes = new Set();
    const childNodes = new Set();

    for (let edge of validEdges) {

        const [parent, child] = edge.split("->");

        allNodes.add(parent);
        allNodes.add(child);

        childNodes.add(child);
    }

    const roots = [];

    for (let node of allNodes) {

        if (!childNodes.has(node)) {
            roots.push(node);
        }

    }

    if (roots.length === 0 && allNodes.size > 0) {
    roots.push([...allNodes].sort()[0]);
}

    const hierarchies = [];

for (let root of roots) {

    const visited = new Set();
    const recursionStack = new Set();

    if (hasCycle(root, graph, visited, recursionStack)) {

        hierarchies.push({
            root: root,
            tree: {},
            has_cycle: true
        });

    } else {

        const tree = {};

        tree[root] = buildTree(root, graph);

        const depth = calculateDepth(root, graph);

        hierarchies.push({
            root: root,
            tree: tree,
    depth: depth
        });

    }

}

let totalTrees = 0;
let totalCycles = 0;

let largestTreeRoot = "";
let maxDepth = 0;

for (let item of hierarchies) {

    if (item.has_cycle) {
        totalCycles++;
    } else {

        totalTrees++;

        if (
            item.depth > maxDepth ||
            (
                item.depth === maxDepth &&
                (largestTreeRoot === "" || item.root < largestTreeRoot)
            )
        ) {
            maxDepth = item.depth;
            largestTreeRoot = item.root;
        }
    }
}

const summary = {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestTreeRoot
};

    

res.json({

    user_id: "palak_26112005",          
    email_id: "palak0592.be23@chitkara.edu.in",
    college_roll_number: "2210990592",

    hierarchies: hierarchies,

    invalid_entries: invalidEntries,

    duplicate_edges: duplicateEdges,

    summary: summary

});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});