const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = 3000;
const XLSX = require("xlsx");

app.listen(port, hostname, () => {
	console.log(`Server Started At Port ${port}!`);
});

const extract = () => {
	const workbook = XLSX.readFile("./data/rawdata.xlsx");
	const sheet_name_list = workbook.SheetNames;
	let worksheet = workbook.Sheets["Sheet1"];
	let headers = {};
	let data = [];
	for (z in worksheet) {
		if (z[0] === "!") continue;
		let tt = 0;
		for (let i = 0; i < z.length; i++) {
			if (!isNaN(z[i])) {
				tt = i;
				break;
			}
		}
		let col = z.substring(0, tt);
		let row = parseInt(z.substring(tt));
		let value = worksheet[z].v;

		if (row == 1 && value) {
			headers[col] = value.toLowerCase();
			continue;
		}

		if (!data[row]) data[row] = {};
		data[row][!headers[col] ? "no" : headers[col]] = value;
	}
	return data;
};

const initGender = {
	1: "Laki-laki",
	2: "Perempuan",
};

const initUsia = {
	1: "Di bawah 20 tahun",
	2: "20 - 25 tahun",
	3: "26 - 30 tahun",
	4: "31 - 35 tahun",
	5: "36 - 40 tahun",
	6: "41 - 44 tahun",
	7: "Di atas 44 tahun",
};

const initKota = {
	1: "Jabodetabek",
	2: "Bandung",
	3: "Semarang",
	4: "Surabaya",
};

const initPendidikan = {
	1: "Tidak ada pendidikan formal",
	2: "Sekolah Dasar  ",
	3: "Sekolah Menengah Pertama ",
	4: "Sekolah Menengah Atas ",
	5: "Akademi (D1/D2/D3) / setingkatnya",
	6: "Sarjana S-1  ",
	7: "Sarjana S-2  ",
	8: "Doktor (Sarjana S-3) ",
	9: "Menolak",
};

const renderCase1 = (data) => {
	let render =
		"<h3>1. Case Responden 20-44 Tahun Dengan Pendidikan Minimal SMA dan Maxsimal Sarjana S-1</h3>";
	render += "<table>";
	render +=
		"<tr><th>Nama</th><th>Kota</th><th>Gender</th><th>Usia</th><th>Pendidikan</th></tr>";
	for (let i of data) {
		render += "<tr>";
		render += `<td>${i.nama.toUpperCase()}</td>`;
		render += `<td>${initKota[i.kota]}</td>`;
		render += `<td>${initGender[i.gender]}</td>`;
		render += `<td>${initUsia[i.usia]}</td>`;
		render += `<td>${initPendidikan[i.pendidikan]}</td>`;
		render += "</tr > ";
	}
	render += "</table>";
	return render;
};

const renderCase2A = (male, female) => {
	let render = `<h4>A. Persentase Berdasarkan Jenis Kelamin Dari ${
		male + female
	} Responden</h4>`;
	render += "<table>";
	render += "<tr><th>Jenis Kelamin</th><th>TOTAL</th></tr>";
	render += "<tr>";
	render += `<td>Laki - Laki</td>`;
	render += `<td>${(male * 100) / 100} %</td>`;
	render += "</tr > ";
	render += "<tr>";
	render += `<td>Perempuan</td>`;
	render += `<td>${(female * 100) / 100} %</td>`;
	render += "</tr > ";
	render += "</table>";
	return render;
};

const renderCase2B = (data) => {
	let render = `<h4>B. Persentase Berdasarkan Kota Dari 100 Responden</h4>`;
	render += "<table>";
	render += "<tr><th>No</th><th>Nama Kota</th><th>TOTAL</th></tr>";
	let no = 1;
	for (let i of data) {
		render += "<tr>";
		render += `<td>${no++}</td>`;
		render += `<td>${i.name}</td>`;
		render += `<td>${(i.total * 100) / 100} %</td>`;
		render += "</tr > ";
	}
	render += "</table>";
	return render;
};

const renderCase3 = (data) => {
	let render = `<h3>3. Persentase Berdasarkan Kota Dan Sorting Kota Terbanyak Dari 100 Responden</h3>`;
	render += "<table>";
	render += "<tr><th>No</th><th>Nama Kota</th><th>TOTAL</th></tr>";
	let no = 1;
	for (let i of data) {
		render += "<tr>";
		render += `<td>${no++}</td>`;
		render += `<td>${i.name}</td>`;
		render += `<td>${(i.total * 100) / 100} %</td>`;
		render += "</tr > ";
	}
	render += "</table>";
	return render;
};

// ROOT ENDPOINT
app.get("/", (req, res) => {
	let data = extract();
	let renderAll = "<html>";
	renderAll += "<title>Kadence</title>";
	renderAll += "<body style='margin:40px'>";
	renderAll +=
		"<style>td,th{border:1px solid #ddd;text-align:left;padding:8px}tr:nth-child(even){background-color:#ddd}</style>";

	// RENDER CASE 1
	let case1 = data.filter((e) => {
		return e.usia >= 2 && e.usia <= 6 && e.pendidikan >= 4 && e.pendidikan <= 6;
	});
	renderAll += renderCase1(case1);

	// RENDER CASE 2
	renderAll += "<hr>";
	renderAll += "<h3>2. Case Render Persentase</h3>";
	renderAll += "<div style='margin-left:40px'>";
	// A
	let male = data.filter((e) => {
		return e.gender === 1;
	});

	let female = data.filter((e) => {
		return e.gender === 2;
	});
	renderAll += renderCase2A(male.length, female.length);

	// B
	let city = [];
	for (let i in initKota) {
		if (city.findIndex((x) => x.name === initKota[i]) === -1) {
			city.push({ id: i, name: initKota[i], total: 0 });
		}
	}
	for (let x in data) {
		city[data[x].kota - 1].total = city[data[x].kota - 1].total + 1;
	}
	renderAll += renderCase2B(city);
	renderAll += "</div>";

	renderAll += "<hr>";
	// RENDER CASE 3
	renderAll += renderCase3(city.sort((a, b) => b.total - a.total));
	renderAll += "</body>";
	renderAll += "</html>";
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/html");
	res.end(renderAll);
});
