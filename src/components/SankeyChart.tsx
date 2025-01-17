import React, { useRef, useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsSankey from 'highcharts/modules/sankey';
import { FinanceData } from '../types';

if (typeof Highcharts === 'object') {
  HighchartsSankey(Highcharts);
}

interface SankeyChartProps {
  data: FinanceData;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ data }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [chartHeight, setChartHeight] = useState<number>(900);

  useEffect(() => {
    const updateChartHeight = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setChartHeight(400);
      } else if (width < 1024) {
        setChartHeight(500);
      } else {
        setChartHeight(1500);
      }
    };

    updateChartHeight();
    window.addEventListener('resize', updateChartHeight);
    return () => window.removeEventListener('resize', updateChartHeight);
  }, []);

  // Vibrant color palette
  const colors = {
    income: ['#FF6B6B', '#FFA07A', '#FFD700'], // Three distinct colors for income
    totalIncome: '#003366', // Dark blue for total income
    categories: ['#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B5DE5', '#F15BB5'], // Six base colors
  };

  const getShade = (color: string, factor: number): string => {
    const hexToRgb = (hex: string) => hex.match(/[a-f\d]{2}/gi)?.map(v => parseInt(v, 16)) ?? [0, 0, 0];
    const rgbToHex = (r: number, g: number, b: number) =>
      `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

    const [r, g, b] = hexToRgb(color);
    return rgbToHex(
      Math.min(Math.round(r + (255 - r) * factor), 255),
      Math.min(Math.round(g + (255 - g) * factor), 255),
      Math.min(Math.round(b + (255 - b) * factor), 255)
    );
  };

  const getLinks = () => {
    const links: { from: string; to: string; weight: number; color?: string; name?: string }[] = [];

    // Links from income sources to total income
    data.incomeSources.forEach((source, index) => {
      const sourceId = `${source.name}`;
      links.push({
        from: sourceId,
        to: 'total-income',
        weight: source.amount,
        color: colors.income[index % colors.income.length],
        name: `${source.name}`, // Use `name`
      });
    });

    data.spendingCategories.forEach((category, index) => {
      const categoryId = `category-${category.id}`;
      const categoryTotal = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);

      links.push({
        from: 'total-income',
        to: categoryId,
        weight: categoryTotal,
        color: colors.categories[index % colors.categories.length],
        name: `${category.name}`, // Use `name`
      });

      category.subCategories.forEach((sub, subIndex) => {
        const subCategoryId = `sub-${category.id}-${sub.id}`;
        links.push({
          from: categoryId,
          to: subCategoryId,
          weight: sub.amount,
          color: getShade(
            colors.categories[index % colors.categories.length],
            0.2 + 0.1 * subIndex
          ),
          name: `${sub.name}`, // Use `name`
        });
      });
    });

    return links;
  };

  const getNodes = () => {
    const nodes: { id: string; name: string; color?: string }[] = [];

    // Add income sources
    data.incomeSources.forEach((source, index) => {
      nodes.push({
        id: `income-${source.id}`,
        name: source.name, // Use `name`
        color: colors.income[index % colors.income.length],
      });
    });

    // Add total income
    nodes.push({
      id: 'total-income',
      name: 'Total Income',
      color: colors.totalIncome,
    });

    // Add spending categories
    data.spendingCategories.forEach((category, index) => {
      nodes.push({
        id: `category-${category.id}`,
        name: category.name, // Use `name`
        color: colors.categories[index % colors.categories.length],
      });

      category.subCategories.forEach((sub, subIndex) => {
        nodes.push({
          id: `sub-${category.id}-${sub.id}`,
          name: sub.name, // Use `name`
          color: getShade(
            colors.categories[index % colors.categories.length],
            0.2 + 0.1 * subIndex
          ),
        });
      });
    });

    return nodes;
  };


  const options: Highcharts.Options = {
    chart: {
      type: 'sankey',
      height: chartHeight,
      zooming: {
        mouseWheel: {
          enabled: true
        },
        pinchType: 'xy'
      },
      panning: {
        enabled: true,
        type: 'xy'
      },
      style: {
        fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }
    },
    title: {
      text: 'Personal Finance Flow',
      style: {
        fontSize: '1.25rem',
        fontWeight: '600'
      }
    },
    tooltip: {
      formatter: function() {
        const point = this.point as any;
        return `<b>${point.fromNode.name} → ${point.toNode.name}</b><br/>
                Amount: €${Highcharts.numberFormat(point.weight, 0, '.', ',')}`;
      },
      style: {
        fontSize: '0.875rem'
      }
    },
    plotOptions: {
      sankey: {
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          nodeFormat: '{point.name}: €{point.sum:,.0f}',
          style: {
            fontSize: '0.875rem',
            textOutline: 'none'
          }
        },
        curveFactor: 0.6,
        nodePadding: 30, // Adjust node padding to create more space vertically
        nodeWidth: 15,   // Adjust node width if necessary for better visualization
        tooltip: {
          headerFormat: '',
          nodeFormat: '{point.name}: €{point.sum:,.0f}',
          pointFormat: '{point.fromNode.name} → {point.toNode.name}: €{point.weight:,.0f}'
        }
      }
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          plotOptions: {
            sankey: {
              dataLabels: {
                style: {
                  fontSize: '0.75rem'
                }
              }
            }
          }
        }
      }]
    },
    credits: {
      enabled: !1
    },
    series: [{
      type: 'sankey',
      name: 'Financial Flow',
      data: getLinks(),
      nodes: getNodes()
    }]
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-hidden">
      <div className="w-full">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />
      </div>
    </div>
  );
};