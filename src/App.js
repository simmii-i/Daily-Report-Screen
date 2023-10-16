import "./App.css";
import "antd/dist/reset.css";
import moment from "moment";
import { Button, Table, Modal, Input, DatePicker } from "antd";
import React, { useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MultiSelectDatePicker from "./MultiSelectDatePicker";

function App() {
  const updateMonthAndYear = (start) => {
    if (start) {
      const startDate = moment(start, "YYYY-MM-DD");
      const startMonthYear = startDate.format("MM");
      return `${startMonthYear}`;
    }
    return "";
  };

  const [selectedExcludedDates, setSelectedExcludedDates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [dataSource, setDataSource] = useState([
    {
      action: "N/A",
      id: "1",
      start: "",
      end: "",
      month: "",
      dates: "",
      number: "",
      lead: "",
      expected: "",
      last: "-",
    },
  ]);

  const handleCustomDateSelect = (date) => {
    if (editingUser) {
      const { start, end } = editingUser;

      if (start && end) {
        const selectedDate = moment(date);

        if (selectedDate.isBetween(start, end, "day", "[]")) {
          // Check if the date is not already in the excluded dates
          if (!selectedExcludedDates.includes(date)) {
            const updatedExcludedDates = [...selectedExcludedDates, date];
            setSelectedExcludedDates(updatedExcludedDates);

            // Update the user's dates
            const userDates = Array.isArray(editingUser.dates)
              ? editingUser.dates
              : [];
            const updatedUser = {
              ...editingUser,
              dates: updatedExcludedDates.join(","),
            };
            setEditingUser(updatedUser);

            setDataSource((prevDataSource) => {
              return prevDataSource.map((user) => {
                if (user.id === editingUser.id) {
                  return updatedUser;
                } else {
                  return user;
                }
              });
            });
          } else {
            // Show a modal window to inform the user that the date is already in the excluded dates.
            Modal.warning({
              title: "Date Already Excluded",
              content: "The selected date is already in the excluded dates.",
            });
          }
        } else {
          // Show a modal window to inform the user that the date is outside the range.
          Modal.error({
            title: "Date Selection Error",
            content: "Please select a date between the start and end dates.",
          });
        }
      }
    }
  };

  const handleSave = () => {
    const currentDateAndTime = moment().format("YYYY-MM-DD HH:mm:ss");
    const numberOfDays = calculateTotalDays(
      editingUser.start,
      editingUser.end,
      editingUser.dates ? editingUser.dates.split(",") : []
    );
    const leadCount = parseFloat(editingUser.lead);
    const expectedDRR = calculateExpectedDRR(leadCount, numberOfDays);
    console.log("calculated DRR", expectedDRR);

    const updatedUser = {
      ...editingUser,
      last: currentDateAndTime,
      dates: selectedExcludedDates.join(","),
      expected: expectedDRR, // Calculate and store the "Expected DRR"
    };
    setEditingUser(updatedUser);

    setDataSource((pre) => {
      return pre.map((user) => {
        if (user.id === editingUser.id) {
          return updatedUser;
        } else {
          return user;
        }
      });
    });

    resetEditing();
  };

  const calculateTotalDays = (start, end, excludedDates) => {
    if (!start || !end) {
      return 0;
    }

    const startDate = moment(start);
    const endDate = moment(end);

    const totalDays = endDate.diff(startDate, "days") + 1;

    if (Array.isArray(excludedDates) && excludedDates.length > 0) {
      // Calculate the number of excluded days within the range
      const excludedDays = excludedDates.filter((date) => {
        const dateMoment = moment(date);
        return dateMoment.isBetween(startDate, endDate, "day", "[]");
      });

      return totalDays - excludedDays.length;
    }

    return totalDays;
  };

  const calculateExpectedDRR = (leadCount, numberOfDays) => {
    if (isNaN(leadCount) || leadCount === 0 || numberOfDays === 0) {
      return "N/A";
    }

    const expectedDRR = (leadCount / numberOfDays).toFixed(2); // Round to 2 decimal places
    return expectedDRR;
  };

  const coloumns = [
    {
      key: "1",
      title: "Action",
      render: (record) => {
        return (
          <>
            <EditOutlined
              onClick={() => onEditUser(record)}
              style={{ color: "green" }}
            />
            <DeleteOutlined
              onClick={() => onDeleteUser(record)}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
    {
      key: "2",
      title: "ID",
      dataIndex: "id",
    },
    {
      key: "start",
      title: "Start Date",
      dataIndex: "start",
      render: (text, record) => moment(record.start).format("YYYY-MM-DD"),
    },
    {
      key: "4",
      title: "End Date",
      dataIndex: "end",
      render: (text, record) => moment(record.end).format("YYYY-MM-DD"),
    },
    {
      key: "5",
      title: "Month",
      dataIndex: "start", // 'Month' column based on 'start' and 'end' dates
      render: (text, record) => updateMonthAndYear(record.start),
    },
    {
      key: "6",
      title: "Dates Excluded",
      dataIndex: "dates",
    },
    {
      key: "7",
      title: "Number of Days",
      dataIndex: "number",
      render: (text, record) => {
        return calculateTotalDays(
          record.start,
          record.end,
          record.dates ? record.dates.split(",") : []
        );
      },
    },
    {
      key: "8",
      title: "Lead Count",
      dataIndex: "lead",
      render: (text, record) => text,
    },
    {
      key: "9",
      title: "Expected DRR",
      dataIndex: "expected",
      render: (text, record) => parseFloat(record.expected),
    },
    {
      key: "10",
      title: "Last Updated",
      dataIndex: "last",
      render: (text, record) =>
        moment(record.last).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const onAdd = () => {
    const randomId = parseInt(Math.random() * 1000);
    const newUser = {
      action: "N/A",
      id: randomId,
      start: "2023-10-03",
      end: "2023-10-07",
      month: "10",
      dates: "2023-10-04",
      number: "1",
      lead: "0",
      expected: "0",
      last: "2023-10-06 13:30:41",
    };
    setDataSource((pre) => {
      return [...pre, newUser];
    });
  };

  const onDeleteUser = (record) => {
    Modal.confirm({
      title: "Are you sure, you want to delete this record ? ",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        setDataSource((pre) => {
          return pre.filter((user) => user.id !== record.id);
        });
      },
    });
  };

  const onEditUser = (record) => {
    setIsEditing(true);
    setEditingUser({ ...record });
    setSelectedExcludedDates(
      record?.dates ? String(record?.dates).split(",") : []
    );
  };

  const resetEditing = () => {
    setIsEditing(false);
    setEditingUser(null);
    
  };

  

  const disabledDate = (current) => {
    if (!current) {
      return false; // No validation if no date is selected
    }

    const minDate = moment("2023-01-01", "YYYY-MM-DD");
    const maxDate = moment("2024-01-01", "YYYY-MM-DD");

    return current.isBefore(minDate) || current.isAfter(maxDate);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Button onClick={onAdd}>Add New User</Button>

        <Table columns={coloumns} dataSource={dataSource}></Table>

        <Modal
          title="Edit User"
          visible={isEditing}
          onCancel={() => {
            resetEditing();
          }}
          onOk={handleSave}
          okText="save"
        >
          <Input
            value={editingUser?.id}
            onChange={(e) => {
              setEditingUser((pre) => {
                return { ...pre, id: e.target.value };
              });
            }}
          />

          <label>
            <h4>Start Date To End Date :</h4>
            <DatePicker.RangePicker
              disabledDate={disabledDate}
              value={
                editingUser?.start && editingUser?.end
                  ? [
                      moment(editingUser.start, "YYYY-MM-DD"),
                      moment(editingUser.end, "YYYY-MM-DD"),
                    ]
                  : []
              }
              onChange={(dates, dateStrings) => {
                setEditingUser((prevUser) => ({
                  ...prevUser,
                  start: dateStrings[0],
                  end: dateStrings[1],
                }));
              }}
            />
          </label>

          <MultiSelectDatePicker
            selectedDates={selectedExcludedDates}
            onDateSelect={handleCustomDateSelect}
            editingUser={editingUser} // Pass the editing user
          />

          <label>
            <h4>Lead Count</h4>
          </label>
          <Input
            value={editingUser?.lead}
            onChange={(e) => {
              setEditingUser((pre) => {
                return { ...pre, lead: e.target.value };
              });
            }}
          />
        </Modal>
      </header>
    </div>
  );
}

export default App;
