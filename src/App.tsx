import { useState, useEffect } from "react";
import {
  PlusCircle,
  X,
  RefreshCw,
  Moon,
  Sun,
  Menu,
  Search,
  Calendar,
  Download,
  Upload,
  Edit,
  Filter,
  Check,
} from "lucide-react";
import {
  LOCAL_STORAGE_KEY,
  LOCAL_STORAGE_THEME_KEY,
  LOCAL_STORAGE_DURATION_FORMAT_KEY,
} from "./constants";

interface Event {
  id: number;
  name: string;
  date: string;
  showAnniversary: boolean;
  showNextDueDate?: boolean;
  dueDuration?: number;
}

type FilterType = "all" | "anniversary" | "duedate" | "neither";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    name: "",
    date: "",
    showAnniversary: false,
    showNextDueDate: false,
    dueDuration: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    return storedTheme === "dark";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDetailedDuration, setShowDetailedDuration] = useState<boolean>(
    () => {
      const storedDurationFormat = localStorage.getItem(
        LOCAL_STORAGE_DURATION_FORMAT_KEY
      );
      return storedDurationFormat === "true";
    }
  );
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const storedEvents = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
    ) as Event[];
    setEvents(storedEvents);

    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    setIsDarkMode(storedTheme === "dark");
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "light");
    }
  }, [isDarkMode]);

  const saveEvents = (updatedEvents: Event[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const addEvent = () => {
    const updatedEvents = [...events, { ...newEvent, id: Date.now() }];
    saveEvents(updatedEvents);
    setNewEvent({
      name: "",
      date: "",
      showAnniversary: false,
      showNextDueDate: false,
      dueDuration: 0,
    });
    setIsModalOpen(false);
  };

  const removeEvent = (id: number) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    saveEvents(updatedEvents);
  };

  const resetEventToToday = (id: number) => {
    const updatedEvents = events.map((event) =>
      event.id === id
        ? { ...event, date: new Date().toISOString().split("T")[0] }
        : event
    );
    saveEvents(updatedEvents);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const updateEvent = () => {
    if (editingEvent) {
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id ? editingEvent : event
      );
      saveEvents(updatedEvents);
      setEditingEvent(null);
      setIsModalOpen(false);
    }
  };

  const calculateDays = (
    date: string,
    showAnniversary: boolean,
    showNextDueDate?: boolean,
    dueDuration?: number
  ): React.ReactNode => {
    const today = new Date();
    const eventDate = new Date(date);
    const timeDiff = today.getTime() - eventDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    let mainResult = "";

    if (showDetailedDuration) {
      let years = today.getFullYear() - eventDate.getFullYear();
      let months = today.getMonth() - eventDate.getMonth();
      let days = today.getDate() - eventDate.getDate();

      if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      mainResult = `${years} years, ${months} months, ${days} days since`;
    } else {
      mainResult = `${daysDiff} days since`;
    }

    let anniversaryResult = null;
    let dueDateResult = null;

    if (showAnniversary) {
      const nextAnniversary = new Date(
        eventDate.setFullYear(today.getFullYear())
      );
      if (nextAnniversary < today)
        nextAnniversary.setFullYear(today.getFullYear() + 1);
      const daysUntilAnniversary = Math.ceil(
        (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      anniversaryResult = (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {daysUntilAnniversary} days until anniversary
        </div>
      );
    }

    if (showNextDueDate && dueDuration) {
      const nextDueDate = new Date(
        eventDate.getTime() + dueDuration * 24 * 60 * 60 * 1000
      );
      const daysUntilDue = Math.ceil(
        (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      dueDateResult = (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {daysUntilDue} days until next due date
        </div>
      );
    }

    return (
      <div>
        <div className="font-medium">{mainResult}</div>
        {anniversaryResult}
        {dueDateResult}
      </div>
    );
  };

  const filteredEvents = events.filter((event) => {
    const nameMatch = event.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    let typeMatch = true;
    if (filterType === "anniversary") {
      typeMatch = event.showAnniversary;
    } else if (filterType === "duedate") {
      typeMatch = event.showNextDueDate || false;
    } else if (filterType === "neither") {
      typeMatch = !event.showAnniversary && !event.showNextDueDate;
    }
    return nameMatch && typeMatch;
  });

  const exportData = () => {
    const data = {
      events: events,
      isDarkMode: isDarkMode,
      showDetailedDuration: showDetailedDuration,
    };
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "days_since_data.json";
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setEvents(data.events);
          setIsDarkMode(data.isDarkMode);
          setShowDetailedDuration(data.showDetailedDuration);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.events));
          localStorage.setItem(
            LOCAL_STORAGE_THEME_KEY,
            data.isDarkMode ? "dark" : "light"
          );
          localStorage.setItem(
            LOCAL_STORAGE_DURATION_FORMAT_KEY,
            data.showDetailedDuration.toString()
          );
        } catch (error) {
          console.error("Error parsing imported data:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              title="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex items-center">
          <button
            onClick={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            className="mr-4 text-blue-500"
            title="Add Event"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
          <button
            onClick={() => {
              const newShowDetailedDuration = !showDetailedDuration;
              localStorage.setItem(
                LOCAL_STORAGE_DURATION_FORMAT_KEY,
                newShowDetailedDuration.toString()
              );
              setShowDetailedDuration(newShowDetailedDuration);
            }}
            className="mr-4 text-blue-500"
            title="Toggle Duration Format"
          >
            <Calendar className="h-6 w-6" />
          </button>
          <button
            onClick={exportData}
            className="mr-4 text-blue-500"
            title="Export Data"
          >
            <Download className="h-6 w-6" />
          </button>
          <label
            className="mr-4 text-blue-500 cursor-pointer"
            title="Import Data"
          >
            <Upload className="h-6 w-6" />
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          <div className="relative mr-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`text-blue-500 flex items-center ${filterType !== "all" ? "bg-blue-100 dark:bg-blue-900 rounded-full p-1" : ""}`}
              title="Filter Events"
            >
              <Filter className="h-6 w-6" />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white">
                {["all", "anniversary", "duedate", "neither"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterType(option as FilterType);
                      setIsFilterOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                    {filterType === option && (
                      <Check className="inline-block ml-2 h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-gray-800 dark:text-white hidden sm:block"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-800 dark:text-white sm:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-0 right-0 mt-16 mr-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center text-gray-800 dark:text-white"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6 mr-2" />
            ) : (
              <Moon className="h-6 w-6 mr-2" />
            )}
            Toggle Dark Mode
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <div className="flex items-center">
                <button
                  onClick={() => editEvent(event)}
                  className="text-blue-500 mr-2"
                  title="Edit event"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => resetEventToToday(event.id)}
                  className="text-blue-500 mr-2"
                  title="Reset to today"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeEvent(event.id)}
                  className="text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p>
              {calculateDays(
                event.date,
                event.showAnniversary,
                event.showNextDueDate,
                event.dueDuration
              )}
            </p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? "Edit Event" : "Add New Event"}
            </h2>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={editingEvent ? editingEvent.name : newEvent.name}
                onChange={(e) =>
                  editingEvent
                    ? setEditingEvent({ ...editingEvent, name: e.target.value })
                    : setNewEvent({ ...newEvent, name: e.target.value })
                }
                className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block mb-1">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={editingEvent ? editingEvent.date : newEvent.date}
                onChange={(e) =>
                  editingEvent
                    ? setEditingEvent({ ...editingEvent, date: e.target.value })
                    : setNewEvent({ ...newEvent, date: e.target.value })
                }
                className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="showAnniversary"
                checked={
                  editingEvent
                    ? editingEvent.showAnniversary
                    : newEvent.showAnniversary
                }
                onChange={(e) =>
                  editingEvent
                    ? setEditingEvent({
                        ...editingEvent,
                        showAnniversary: e.target.checked,
                      })
                    : setNewEvent({
                        ...newEvent,
                        showAnniversary: e.target.checked,
                      })
                }
                className="mr-2"
              />
              <label htmlFor="showAnniversary">
                Show days until anniversary
              </label>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="showNextDueDate"
                checked={
                  editingEvent
                    ? editingEvent.showNextDueDate
                    : newEvent.showNextDueDate
                }
                onChange={(e) =>
                  editingEvent
                    ? setEditingEvent({
                        ...editingEvent,
                        showNextDueDate: e.target.checked,
                      })
                    : setNewEvent({
                        ...newEvent,
                        showNextDueDate: e.target.checked,
                      })
                }
                className="mr-2"
              />
              <label htmlFor="showNextDueDate">Show next due date</label>
            </div>
            {(editingEvent
              ? editingEvent.showNextDueDate
              : newEvent.showNextDueDate) && (
              <div className="mb-4">
                <label htmlFor="dueDuration" className="block mb-1">
                  Due Duration (in days)
                </label>
                <input
                  id="dueDuration"
                  type="number"
                  value={
                    editingEvent
                      ? editingEvent.dueDuration
                      : newEvent.dueDuration
                  }
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          dueDuration: parseInt(e.target.value),
                        })
                      : setNewEvent({
                          ...newEvent,
                          dueDuration: parseInt(e.target.value),
                        })
                  }
                  className="w-full border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 border rounded dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={editingEvent ? updateEvent : addEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {editingEvent ? "Update Event" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
