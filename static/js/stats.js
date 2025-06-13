Highcharts.chart('container1', {
    chart: { type: 'line' },
    title: { text: 'Cantidad de Actividades por Día' },
    xAxis: {
        type: 'datetime',
        title: { text: 'Día' },
        dateTimeLabelFormats: { day: '%e de %b' }
    },
    yAxis: { type: 'int',
             title: { text: 'Cantidad' } 
    },
    series: [{ name: 'Actividades', data: [] }]
    });

Highcharts.chart('container2', {
    chart: {
        type: 'pie'
    },
    title: {
        text: 'Cantidad de Actividades por Tipo'
    },
    series: [{
        name: 'Actividades',
        colorByPoint: true,
        data: []
    }]
});

Highcharts.chart('container3', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Cantidad de Actividades por Mes'
    },
    xAxis: {
        categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        title: {
            text: 'Meses'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Cantidad de Actividades'
        }
    },
    series: [{
        name: 'Mañana',
        data: []
    }, {
        name: 'Mediodía',
        data: []
    }, {
        name: 'Tarde',
        data: []
    }]
});

fetch(`${window.origin}/get-stats-data`)
    .then(response => response.json())
    .then((data) => {

        let parsedData = data.actividades_por_dia.map((item) => {
            const [year, month, day] = item.dia
                .split('-')
                .map(part => parseInt(part, 10));
            return [
                Date.UTC(year, month - 1, day),
                item.cantidad
            ];
        });

        let parsedData2 = data.actividades_por_tipo.map((item) => {
            return {
                name: item.tema,
                y: item.cantidad
            };
        });
        
        const chart1 = Highcharts.charts.find(
            chart => chart.renderTo.id === 'container1'
        );

        const chart2 = Highcharts.charts.find(
            chart => chart.renderTo.id === 'container2'
        );

        const chart3 = Highcharts.charts.find(
            chart => chart.renderTo.id === 'container3'
        );

        chart1.update({
            series: [{
                data: parsedData
            }]
        });

        chart2.update({
            series: [{
                data: parsedData2
            }]
        });

        chart3.update({
            series: [{
                name: 'Mañana',
                data: data.actividades_por_mes_horario.mañana
            }, {
                name: 'Mediodía',
                data: data.actividades_por_mes_horario.mediodia
            }, {
                name: 'Tarde',
                data: data.actividades_por_mes_horario.tarde
            }]
        });

    })
    .catch(error => console.error('Error obtenidendo los datos:', error));

