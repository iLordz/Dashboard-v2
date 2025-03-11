import { useState, useEffect, useRef } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, ArcElement, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import datos from '../datos.json';
import { FaFilter } from "react-icons/fa";
ChartJS.register(CategoryScale, ArcElement, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, zoomPlugin);

const Graphs = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null);
  // Duración de visita y edad
  const [chartData, setChartData] = useState(null);
  const [view, setView] = useState("duration");
  const chartRef = useRef(null);

  // Genero masculino y femenino
  const [genderFilter, setGenderFilter] = useState("all");
  const maleCount = datos.filter((d) => d.Gender === "male").length;
  const femaleCount = datos.filter((d) => d.Gender === "female").length;
  const total = maleCount + femaleCount;

  const filteredData =
    genderFilter === "male"
      ? [((maleCount / total) * 100).toFixed(2), 0]
      : genderFilter === "female"
        ? [0, ((femaleCount / total) * 100).toFixed(2)]
        : [((maleCount / total) * 100).toFixed(2), ((femaleCount / total) * 100).toFixed(2)];

  const genderChartData = {
    labels: ["Distribución por géneros"],
    datasets: [
      {
        label: "Distribución en %",
        data: filteredData,
        backgroundColor: ["blue", "pink"],
        borderColor: ["darkblue", "darkred"],
        borderWidth: 1
      }
    ]
  };

  const generateChartData = (type) => {
    const labels = datos.map(item => item["Visit Start"]);

    if (type === "duration") {
      const visitDurations = datos.map(item => parseInt(item["Visit Duration"]));
      return {
        labels,
        datasets: [
          {
            label: 'Duración de Visita (segundos)',
            data: visitDurations,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
          },
        ],
      };
    } else if (type === "age") {
      const ages = datos.map(item => parseInt(item["Age"]));
      return {
        labels,
        datasets: [
          {
            label: 'Edad del Visitante',
            data: ages,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
          },
        ],
      };
    }
  };

  useEffect(() => {
    setChartData(generateChartData(view));
  }, [view]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        labels: {
          boxWidth: 0,
          boxHeight: 0,
          color: 'black'
        }
      }
    }
  };

  // Configuración básica de opciones para la gráfica
  let options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        display: false,
      },
      y: {
        display: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          boxWidth: 3,   // Ancho del recuadro
          boxHeight: 3,  // Alto del recuadro
          color: 'black' // Color del texto
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          speed: 10,
          threshold: 10,
        },
        zoom: {
          wheel: { enabled: true }, // Zoom con la rueda del ratón
          pinch: { enabled: true }, // Zoom con pellizco en dispositivos táctiles
          mode: 'x',  // Zoom solo en el eje X
          speed: 0.1,
          threshold: 2,
        },
      },
    },
  };

  if (chartData && chartData.labels.length > 10) {
    options.scales.x.min = chartData.labels[chartData.labels.length - 10];
    options.scales.x.max = chartData.labels[chartData.labels.length - 1];
  }

  return (
    <div>
      <div className="container">
        <div className="relative inline-block" ref={menuRef}>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setIsOpen(!isOpen)}>
            <FaFilter className="text-gray-600" />
            Filtrar
          </button>

          {/* Menú desplegable sin espacio extra cuando está cerrado */}
          <div
            className={`absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${isOpen ? "opacity-100 scale-100 visible pointer-events-auto" : "opacity-0 scale-95 invisible pointer-events-none"
              }`}>
            <ul className="py-2 list-none">
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => { setView("duration"); setIsOpen(false); }}>Mostrar Duración</li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => { setView("age"); setIsOpen(false); }}>Mostrar Edad</li>
              <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => { setGenderFilter("male"); setIsOpen(false); }}>Mostrar Hombres</li>
            </ul>
          </div>
        </div>

      </div>
      <h1 className='container text-center'>Gráficas</h1>
      <div className="container graphs-container">
        <div className="graph-group">
          <div className="graph1">
            {chartData && <Line ref={chartRef} data={chartData} options={options} />}
          </div>
          <div className="button-container">
            <button className="btn btn-secondary" onClick={() => setView("duration")}>Mostrar Duración</button>
            <button className="btn btn-secondary" onClick={() => setView("age")}>Mostrar Edad</button>
          </div>
        </div>
        <div className="graph-group">
          <div className="graph1">
            <Pie data={genderChartData} options={chartOptions} />
          </div>
          <div className="button-container">
            <button className="btn btn-secondary" onClick={() => setGenderFilter("male")}>Mostrar Hombres</button>
            <button className="btn btn-secondary" onClick={() => setGenderFilter("female")}>Mostrar Mujeres</button>
            <button className="btn btn-secondary" onClick={() => setGenderFilter("all")}>Mostrar Ambos</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Graphs;
