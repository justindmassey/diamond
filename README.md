# Diamond 💎

Diamond is an interactive tool for **growing and exploring trees using dot-paths**.

You type paths.
Diamond inserts them into a tree.

If a path causes **no insertion**, Diamond prints the **matching endpoint subtrees**.

The tree is stored as **indented text** in `diamond.tree`.

---

# Example

Input:

```
person.name.first
person.name.last
person.address.city
```

Tree:

```
person
    name
        first
        last
    address
        city
```

---

# Paths

Each line is a **dot-separated path**.

```
a.b.c
```

means:

```
a
    b
        c
```

Missing segments are **created automatically**.

---

# Fan-out

Diamond’s key feature is **fan-out**.

If the first segment is **non-empty**, Diamond searches the **entire tree** for nodes with that name and applies the rest of the path to **all matches**.

Example tree:

```
company
    person
        name
            first
school
    person
        name
            first
```

Input:

```
person.address.city
```

Result:

```
company
    person
        name
            first
        address
            city
school
    person
        name
            first
        address
            city
```

If no matching seed nodes exist, Diamond creates the full path starting from the root.

---

# Root-anchored paths

A leading `.` anchors the path at the root and **disables fan-out**.

```
.person.name.middle
```

This follows the path strictly from the root.

---

# Printing

Diamond prints results **only when nothing was inserted**.

When printing:

* The **endpoint subtree** is printed.
* If multiple matches occur, the **full path to the endpoint** is printed in magenta.

Example query:

```
person.name
```

Output:

```
person.name
name
    first
    last
```

---

# Wildcards

`*` matches **any node at that level**.

Example tree:

```
people
    alice
        name
            first
    bob
        name
            first
```

Input:

```
people.*.address.city
```

Result:

```
people
    alice
        name
            first
        address
            city
    bob
        name
            first
        address
            city
```

The wildcard **fans out over existing children only**.
It does **not create nodes by itself**.

---

# Forced append

Prefix a segment with `+` to **always create a new node**.

```
person.+note.text
```

This appends a new `note` node even if one already exists.

---

# Deletion

Prefix a path with `-` to delete matching nodes.

```
-person.address
```

Special case:

```
-.
```

Clears the entire tree.

---

# Variables

Variables can be assigned with:

```
key=value
```

Example:

```
field=name
person.field.first
```

becomes:

```
person.name.first
```

Remove a variable:

```
field=
```

Variables exist only during the current session.

---

# Inspecting the root

Entering a single dot prints all top-level subtrees:

```
.
```

---

# Storage

Diamond stores the tree in:

```
diamond.tree
```

Format:

```
node
    child
        grandchild
```

---

# Philosophy

Diamond is designed to be:

* **minimal**
* **interactive**
* **structurally expressive**

You grow a tree by typing paths.

Sometimes you insert structure.
Sometimes you discover what already exists.