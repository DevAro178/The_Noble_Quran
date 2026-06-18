var http = require("http");
var fs = require("fs");
var mysql = require("mysql2/promise");
const DB_NAME = "AlQuran";
var pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  // user: process.env.DB_USER || "pitppk_al_quran",
  // password: process.env.DB_PASSWORD || "Tj-.H_?dO72@AI3T",
  // database: process.env.DB_NAME || "pitppk_al_quran",
  user: process.env.DB_USER || "dev",
  password: process.env.DB_PASSWORD || "test111",
  database: process.env.DB_NAME || DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

function sendJson(res, statusCode, data) {
  var body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

function parseUrl(reqUrl) {
  var url = new URL(reqUrl, "http://localhost");

  var pathname = url.pathname;

  // Remove application base path if present
  pathname = pathname.replace(/^\/qapi\.pitp\.pk(?=\/|$)/, "");

  // Ensure root path remains "/"
  if (pathname === "") {
    pathname = "/";
  }

  return {
    pathname: pathname,
    searchParams: url.searchParams,
  };
}

var server = http.createServer(function (req, res) {
  var { pathname, searchParams } = parseUrl(req.url);

  if (pathname === "/health" && req.method === "GET") {
    return sendJson(res, 200, {
      success: true,
      message: "Al-Quran API server is running.",
    });
  }

  if (pathname === "/api/surahs" && req.method === "GET") {
    return pool
      .query(
        `
      SELECT suraNo, suraName, MIN(paraNo) AS paraNo, MIN(paraName) AS paraName, COUNT(*) AS totalAyat
      FROM quran GROUP BY suraNo, suraName ORDER BY suraNo ASC
    `,
      )
      .then(function ([rows]) {
        sendJson(res, 200, { success: true, data: rows });
      })
      .catch(function (error) {
        console.error("Error fetching surahs:", error);
        sendJson(res, 500, {
          success: false,
          message: "Server error fetching surahs list",
        });
      });
  }

  if (pathname === "/api/surahs/search" && req.method === "GET") {
    var q = searchParams.get("q");
    if (!q) {
      return sendJson(res, 400, {
        success: false,
        message: "Query parameter q is required",
      });
    }
    var searchPattern = "%" + q.trim() + "%";
    return pool
      .query(
        `
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${DB_NAME}' AND TABLE_NAME = 'search_keywords'
    `,
      )
      .then(function ([columnsInfo]) {
        if (!columnsInfo || columnsInfo.length === 0) {
          throw new Error(
            "Table 'search_keywords' not found or has no columns.",
          );
        }
        var columnNames = columnsInfo.map(function (col) {
          return col.COLUMN_NAME || col.column_name;
        });
        var hasSurahNo = columnNames.indexOf("surahNo") !== -1;
        var hasSuraNo = columnNames.indexOf("suraNo") !== -1;
        var hasId = columnNames.indexOf("id") !== -1;
        var suraJoinCol = hasSurahNo
          ? "sk.surahNo"
          : hasSuraNo
            ? "sk.suraNo"
            : hasId
              ? "sk.id"
              : null;
        if (!suraJoinCol) {
          throw new Error(
            "Could not find a valid matching suraNo/surahNo/id column in search_keywords table.",
          );
        }
        var whereClauses = [];
        var queryParams = [];
        var isNum = !isNaN(q.trim());
        if (isNum) {
          whereClauses.push(suraJoinCol + " = ?");
          queryParams.push(parseInt(q.trim()));
        }
        columnNames.forEach(function (col) {
          var lowerCol = col.toLowerCase();
          if (
            lowerCol !== "id" &&
            lowerCol !== "surano" &&
            lowerCol !== "surahno"
          ) {
            whereClauses.push("sk." + col + " LIKE ?");
            queryParams.push(searchPattern);
          }
        });
        if (whereClauses.length > 0) {
          return pool
            .query(
              "SELECT q.suraNo, q.suraName, MIN(q.paraNo) AS paraNo, MIN(q.paraName) AS paraName, COUNT(*) AS totalAyat " +
                "FROM quran q JOIN search_keywords sk ON q.suraNo = " +
                suraJoinCol +
                " " +
                "WHERE " +
                whereClauses.join(" OR ") +
                " " +
                "GROUP BY q.suraNo, q.suraName ORDER BY q.suraNo ASC",
              queryParams,
            )
            .then(function ([rows]) {
              sendJson(res, 200, { success: true, data: rows });
            });
        }
        sendJson(res, 200, { success: true, data: [] });
      })
      .catch(function (error) {
        var logMsg =
          "[" +
          new Date().toISOString() +
          "] Error performing surah search: " +
          (error && error.message ? error.message : String(error)) +
          "\n";
        console.error(logMsg.trim());
        fs.appendFile("errors.log", logMsg, function () {});
        sendJson(res, 500, {
          success: false,
          message: "Server error searching surahs",
        });
      });
  }

  var suraMatch = pathname.match(/^\/api\/surah\/(\d+)$/);
  if (suraMatch && req.method === "GET") {
    var suraNo = suraMatch[1];
    return pool
      .query("SELECT * FROM quran WHERE suraNo = ? ORDER BY ayatNo ASC", [
        suraNo,
      ])
      .then(function ([rows]) {
        if (rows.length === 0) {
          return sendJson(res, 404, {
            success: false,
            message: "Surah number " + suraNo + " not found",
          });
        }
        sendJson(res, 200, { success: true, data: rows });
      })
      .catch(function (error) {
        console.error("Error fetching verses for surah " + suraNo + ":", error);
        sendJson(res, 500, {
          success: false,
          message: "Server error fetching surah verses",
        });
      });
  }

  if (pathname === "/api/search" && req.method === "GET") {
    var q = searchParams.get("q");
    if (!q) {
      return sendJson(res, 400, {
        success: false,
        message: "Query parameter q is required",
      });
    }
    var searchPattern = "%" + q + "%";
    return pool
      .query(
        "SELECT id, suraNo, suraName, ayatNo, quranArabic, quMehmood, quFateh, engTaqi, engMohsin " +
          "FROM quran WHERE suraName LIKE ? OR quMehmood LIKE ? OR quFateh LIKE ? OR engTaqi LIKE ? OR engMohsin LIKE ? LIMIT 50",
        [
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern,
          searchPattern,
        ],
      )
      .then(function ([rows]) {
        sendJson(res, 200, { success: true, data: rows });
      })
      .catch(function (error) {
        console.error("Error performing search:", error);
        sendJson(res, 500, {
          success: false,
          message: "Server error performing search",
        });
      });
  }

  sendJson(res, 404, { success: false, message: "Not found" });
});

server.listen(3001, function () {
  console.log("Server listening on http://localhost:3000");
});
