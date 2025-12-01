import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DumbCharts() {

    const [matchData, setMatchData] = useState(null);
    const [playerComparisonData, setPlayerComparisonData] = useState(null);
    const [playerSoulsData, setPlayerSoulsData] = useState(null);

    useEffect(() => {
        async function getMatchData() {
          try {
            const response = await fetch('http://localhost:3001/api/matchData');
            if (!response.ok) throw new Error('Deadlock MatchData request failed');
            const matchData = await response.json();
            // console.log('Fetched Match Data:', matchData);
            setMatchData(matchData);
          } catch (err) {
            console.error('Error fetching Match data:', err);
          }
        }

        async function getPlayerComparison() {
          try {
            const response = await fetch('http://localhost:3001/api/averageDeaths');
            if (!response.ok) throw new Error('Average Deaths request failed');
            const comparisonData = await response.json();
            // console.log('Fetched Comparison Data:', comparisonData);
            setPlayerComparisonData(comparisonData);
          } catch (err) {
            console.error('Error fetching comparison data:', err);
          }
        }

        async function getPlayerSouls() {
          try {
            const response = await fetch('http://localhost:3001/api/averageSouls');
            if (!response.ok) throw new Error('Average Souls request failed');
            const comparisonData = await response.json();
            console.log('Fetched Souls Data:', comparisonData);
            setPlayerSoulsData(comparisonData);
          } catch (err) {
            console.error('Error fetching comparison data:', err);
          }
        }


        
        getMatchData();
        getPlayerComparison();
        getPlayerSouls();
      }, []);


    // Base chart configuration - shared settings
    const baseChartOptions = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { size: 16 },
            color: '#66c0f4'
          }
        },
        title: {
          display: true,
          font: { size: 20 },
          color: '#66c0f4'
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            font: { size: 16 },
            color: '#66c0f4'
          },
          ticks: {
            font: { size: 14 },
            color: '#66c0f4'
          }
        },
        x: {
          title: {
            display: true,
            font: { size: 16 },
            color: '#66c0f4'
          },
          ticks: {
            font: { size: 14 },
            color: '#66c0f4'
          }
        }
      }
    };

    // Line chart options - only override what's different
    const options = {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          ...baseChartOptions.plugins.title,
          text: 'LoGIC Last 5 Matches - Deaths Over Time'
        }
      },
      scales: {
        ...baseChartOptions.scales,
        y: {
          ...baseChartOptions.scales.y,
          title: {
            ...baseChartOptions.scales.y.title,
            text: 'Deaths :('
          }
        },
        x: {
          ...baseChartOptions.scales.x,
          title: {
            ...baseChartOptions.scales.x.title,
            text: 'Match Number'
          }
        }
      }
    };

    // Bar chart options - only override what's different
    const options2 = {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          ...baseChartOptions.plugins.title,
          text: 'Average Deaths over all games'
        }
      },
      scales: {
        ...baseChartOptions.scales,
        y: {
          ...baseChartOptions.scales.y,
          title: {
            ...baseChartOptions.scales.y.title,
            text: 'Average Deaths'
          }
        },
        x: {
          ...baseChartOptions.scales.x,
          title: {
            ...baseChartOptions.scales.x.title,
            text: 'Player'
          }
        }
      }
    };

    const options3 = {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          ...baseChartOptions.plugins.title,
          text: 'Average Souls over all games'
        }
      },
      scales: {
        ...baseChartOptions.scales,
        y: {
          ...baseChartOptions.scales.y,
          min: 30000, // Force Y-axis to start at 30,000
          title: {
            ...baseChartOptions.scales.y.title,
            text: 'Average Souls'
          },
          ticks: {
            ...baseChartOptions.scales.y.ticks,
            callback: function(value) {
              // Format large numbers with commas
              return value.toLocaleString();
            }
          }
        },
        x: {
          ...baseChartOptions.scales.x,
          title: {
            ...baseChartOptions.scales.x.title,
            text: 'Player'
          }
        }
      }
    };


 
    // Prepare chart data
    const chartData = matchData ? {
      labels: matchData.slice(0,5).map(match => {
        if (match.start_time) {
          // Convert Unix timestamp to readable date
          const date = new Date(match.start_time * 1000);
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
        }
        return 'Unknown Date';
      }),
      datasets: [
        {
          label: 'Deaths',
          data: matchData.map(match => match.player_deaths || 0),
          borderColor: 'rgba(223, 15, 15, 1)',
          backgroundColor: 'rgba(223, 15, 15, 1)',
          tension: 0.1
        }
      ]
    } : null;

    // Prepare bar chart data for player comparison
    const chartData2 = playerComparisonData ? {
      labels: playerComparisonData.map(player => player.name),
      datasets: [
        {
          label: 'Average Deaths',
          data: playerComparisonData.map(player => player.averageDeaths),
          backgroundColor: [
            'rgba(102, 192, 244, 0.8)', // Steam blue
            'rgba(255, 99, 132, 0.8)',  // Red
            'rgba(54, 162, 235, 0.8)'   // Blue
          ],
          borderColor: [
            'rgba(102, 192, 244, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 2
        }
      ]
    } : null;

    // Prepare bar chart data for souls comparison
    const chartData3 = playerSoulsData ? {
      labels: playerSoulsData.map(player => player.name),
      datasets: [
        {
          label: 'Average Souls',
          data: playerSoulsData.map(player => player.averageSouls),
          backgroundColor: [
            'rgba(102, 192, 244, 0.8)', // Steam blue
            'rgba(255, 99, 132, 0.8)',  // Red
            'rgba(54, 162, 235, 0.8)'   // Blue
          ],
          borderColor: [
            'rgba(102, 192, 244, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 2
        }
      ]
    } : null;

    return (
    <div className="section section--full-height">
      <div className="section__inner">
        <h1>Match Statistics</h1>
        <div className='chartContainer'>
        <div className='chartBackground'>
        {matchData ? (
          chartData ? (
            <div>
              <Line 
                options={options} 
                data={chartData} 
                width={600}
                height={400}
              />
            </div>
          ) : (
            <p>No chart data available</p>
          )
        ) : (
          <p>Loading match data...</p>
        )}
        </div>
        <div className='chartBackground'>
        {playerComparisonData ? (
          chartData2 ? (
            <div>
              <Bar 
                options={options2} 
                data={chartData2} 
                width={600}
                height={400}
              />
            </div>
          ) : (
            <p>No comparison chart data available</p>
          )
        ) : (
          <p>Loading player comparison data...</p>
        )}
        </div>
        <div className='chartBackground'>
        {playerSoulsData ? (
          chartData3 ? (
            <div>
              <Bar 
                options={options3} 
                data={chartData3} 
                width={600}
                height={400}
              />
            </div>
          ) : (
            <p>No comparison chart data available</p>
          )
        ) : (
          <p>Loading player comparison data...</p>
        )}
        </div>
        </div>

        
      </div>
    </div>
  );
}
