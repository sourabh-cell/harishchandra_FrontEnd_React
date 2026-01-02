
      $(document).ready(function () {
        // Initialize DataTable
        var table = $("#doctorTable").DataTable({
          pagingType: "simple",
          responsive: true,
          columnDefs: [
            {
              targets: [0, 1, 2],
              responsivePriority: 1,
            },
            {
              targets: [3, 4, 5, 6],
              responsivePriority: 2,
            },
          ],
          order: [[0, "asc"]],
        });

        // Exit button
        $("#exitBtn").click(function () {
          $("#invoiceForm").hide();
          $("#tableSection").show();
        });
      });
   