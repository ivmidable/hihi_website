import React, { useState } from 'react';
import './WorkTable.css';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';

export default function WorkTable({data}) {
    const [page, setPage] = useState(() => {
        return 0;
    });

    const [rowsPerPage, setRowsPerPage] = React.useState(()=> {
        return 5;
    });


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.work.length - page * rowsPerPage);

    const WorkTableCell = withStyles({
        root: {
            border: 0,
            color: '#253a5e',
        }
    })(TableCell);

    const WorkTablePagination = withStyles({
        root: {
            border: 0,
            color: '#253a5e',
        }
    })(TablePagination);

    return (
        <div>
            <div className="workTableLabel">Limit Break Work</div>
                <TableContainer>
                    <Table aria-label="Limit Break Work">
                        <TableHead>
                            <TableRow>
                                <WorkTableCell align="center">Tokens</WorkTableCell>
                                <WorkTableCell align="center">Hash</WorkTableCell>
                                <WorkTableCell align="center">Magic</WorkTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow className="limitBreakRow"  key={data.limit_break.hash}>
                                <WorkTableCell align="center">{data.limit_break.tokens}</WorkTableCell>
                                <WorkTableCell align="center">{`${data.limit_break.hash.slice(0,10)}....${data.limit_break.hash.slice(54,64)}`}</WorkTableCell>
                                <WorkTableCell align="center">{data.limit_break.magic}</WorkTableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className="workTableLabel">Breach Work</div>
                <TableContainer>
                    <Table
                        aria-labelledby="breachWork"
                        aria-label="Break Work"
                    >
                        <TableBody>
                            {data.work
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {

                                    return (
                                        <TableRow key={row.hash}>
                                            <WorkTableCell align="center">{row.tokens}</WorkTableCell>
                                            <WorkTableCell align="center">{`${row.hash.slice(0,10)}....${row.hash.slice(54,64)}`}</WorkTableCell>
                                            <WorkTableCell align="center">{row.magic}</WorkTableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <WorkTablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    count={data.work.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
        </div>
    );
}