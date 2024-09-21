import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./AdminPanel.css";

const AdminPanel = () => {
  const initialUsers = [];
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  // Fetch users from API

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
      );
      const fetchedUsers = response.data;
      const filtered = query
        ? fetchedUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(query.toLowerCase()) ||
              user.email.toLowerCase().includes(query.toLowerCase()) ||
              user.role.toLowerCase().includes(query.toLowerCase())
          )
        : fetchedUsers;

      setUsers(fetchedUsers);
      setFilteredUsers(filtered); // Set the filtered users as well
    } catch (error) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); //Initial fetch without query
  }, []);

  // Handle search input
  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  //Handle search button click
  const handleSearchClick = () => {
    fetchUsers(searchTerm); // trigger fetch with the search term
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const displayedIndexes = filteredUsers
        .slice(pagesVisited, pagesVisited + usersPerPage)
        .map((_, idx) => idx + pagesVisited);
      setSelectedUsers(displayedIndexes);
    } else {
      setSelectedUsers([]);
    }
  };

  // Handle individual row checkbox
  const handleCheckboxChange = (index) => {
    if (selectedUsers.includes(index)) {
      setSelectedUsers(selectedUsers.filter((selected) => selected !== index));
    } else {
      setSelectedUsers([...selectedUsers, index]);
    }
  };

  // Handle user deletion
  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers); // Update the filtered list if search is applied
  };

  // Handle bulk deletion
  const deleteSelectedUsers = () => {
    const updatedUsers = users.filter(
      (_, index) => !selectedUsers.includes(index)
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers); // Update the filtered list
    setSelectedUsers([]); // Clear selection
  };

  // Handle editing
  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleSave = () => {
    const updatedUsers = users.map((user) =>
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers); // Update the filtered list
    setEditingUser(null); // Close the modal
  };

  const handleInputChange = (e, field) => {
    setEditingUser({ ...editingUser, [field]: e.target.value });
  };

  const displayUsers = filteredUsers
    .slice(pagesVisited, pagesVisited + usersPerPage)
    .map((user, index) => {
      const isSelected = selectedUsers.includes(index);

      return (
        <tr key={user.id}>
          <td>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCheckboxChange(index)}
            />
          </td>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>
            <button className="edit" onClick={() => handleEdit(user)}>
              <FaEdit />
            </button>
            <button className="delete" onClick={() => handleDelete(user.id)}>
              <FaTrash />
            </button>
          </td>
        </tr>
      );
    });

  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-panel">
      {/* Search Bar */}
      <div className="header">
        <div className="search-container">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="search-bar"
            value={searchTerm}
            onChange={handleSearchInput} //update input value
          />
          <button onClick={handleSearchClick} className="search-button">
            {" "}
            Search
          </button>
        </div>
        <button className="delete" onClick={deleteSelectedUsers}>
          <FaTrash /> Delete Selected
        </button>
      </div>

      {/* Table */}
      <table className="user-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" onChange={handleSelectAll} />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{displayUsers}</tbody>
      </table>

      {/* Pagination */}
      <div className="pagination-info">
        <p>
          Total {filteredUsers.length} users, Total {pageCount} page
          {pageCount > 1 ? "s" : ""}.
        </p>
      </div>
      <ReactPaginate
        previousLabel={"«"}
        nextLabel={"»"}
        pageCount={pageCount}
        onPageChange={changePage}
        containerClassName={"pagination"}
        activeClassName={"active"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"previous-page"}
        nextClassName={"next-page"}
      />

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Edit User</h2>
            <input
              type="text"
              value={editingUser.name}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Name"
            />
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) => handleInputChange(e, "email")}
              placeholder="Email"
            />
            <input
              type="text"
              value={editingUser.role}
              onChange={(e) => handleInputChange(e, "role")}
              placeholder="Role"
            />
            <div className="modal-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPanel;
