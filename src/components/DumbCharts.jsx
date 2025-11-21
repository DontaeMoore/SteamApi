import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DumbCharts() {

    const [matchData, setMatchData] = useState(null);

    useEffect(() => {
        async function getMatchData() {
          try {
            const response = await fetch('http://localhost:3001/api/matchData');
            if (!response.ok) throw new Error('Deadlock MatchData request failed');
            const matchData = await response.json();
            console.log('Fetched Match Data:', matchData);
            setMatchData(matchData);
          } catch (err) {
            console.error('Error fetching Match data:', err);
          }
        }
        getMatchData();
      }, []);


    // Chart configuration options
    const options = {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 16
            },
            color: '#66c0f4'
          }
        },
        title: {
          display: true,
          text: 'LoGIC Last 5 Matches - Deaths Over Time',
          font: {
            size: 20
          },
          color: '#66c0f4'
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Deaths :(',
            font: {
              size: 16
            },
            color: '#66c0f4'
          },
          ticks: {
            font: {
              size: 14
            },
            color: '#66c0f4'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Match Number',
            font: {
              size: 16
            },
            color: '#66c0f4'
          },
          ticks: {
            font: {
              size: 14
            },
            color: '#66c0f4'
          }
        }
      }
    };


 
    // Prepare chart data
    const chartData = matchData ? {
      labels: matchData.map(match => {
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

    return (
    <div className="section section--full-height">
      <div className="section__inner">
        <h1>Match Statistics</h1>
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
      </div>
    </div>
  );
}
